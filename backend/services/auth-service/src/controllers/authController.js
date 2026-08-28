const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/User');
const { publishEvent } = require('../config/rabbitmq');
const crypto = require('crypto');

const roleHierarchy = {
  super_admin: ['student', 'faculty', 'management', 'admin', 'super_admin'],
  admin: ['student', 'faculty', 'management'],
  management: ['student', 'faculty'],
  faculty: ['student'],
  student: []
};

function canManageRole(creatorRole, targetRole) {
  return roleHierarchy[creatorRole]?.includes(targetRole) || false;
}

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    const requestedRole = role || 'student';

    // RBAC Check
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access denied. No token provided for user creation.' });
      }
      try {
        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        if (!canManageRole(decoded.role, requestedRole)) {
          return res.status(403).json({ error: `Access denied. Role '${decoded.role}' cannot create user with role '${requestedRole}'.` });
        }
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token for user creation.' });
      }
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: requestedRole
    });

    await newUser.save();

    publishEvent('user.registered', {
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    // Issue token immediately so frontend can auto-login after registration
    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role, email: newUser.email, username: newUser.username },
      JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.login = async (req, res) => {
  try {
    const { identifier, password, domain } = req.body;
    if (!identifier || !password || !domain) {
      return res.status(400).json({ error: 'Identifier, password, and domain are required' });
    }

    const validDomains = ['student', 'faculty', 'admin', 'management'];
    if (!validDomains.includes(domain)) {
      return res.status(400).json({ error: 'Invalid domain' });
    }

    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });
    if (!user || user.role !== domain) {
      // Intentionally generic error message to prevent enumeration
      return res.status(401).json({ error: 'Invalid credentials or access not permitted for this domain' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials or access not permitted for this domain' });
    }

    if (user.isTwoFactorEnabled) {
      const tempToken = jwt.sign(
        { userId: user._id, role: user.role, email: user.email, username: user.username, isTemp: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.json({
        requires2FA: true,
        tempToken,
        message: '2FA required'
      });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
    );

    publishEvent('user.login', {
      userId: user._id,
      username: user.username,
      role: user.role
    });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const secret = speakeasy.generateSecret({
      name: `EduSphere (${user.email})`
    });
    
    user.twoFactorSecret = secret.base32;
    await user.save();
    
    qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
      if (err) return res.status(500).json({ error: 'Failed to generate QR Code' });
      res.json({
        secret: secret.base32,
        qrCode: data_url
      });
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (verified) {
      user.isTwoFactorEnabled = true;
      await user.save();
      return res.json({ message: '2FA enabled successfully' });
    } else {
      return res.status(400).json({ error: 'Invalid 2FA token' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.login2FA = async (req, res) => {
  try {
    const { tempToken, token } = req.body;
    if (!tempToken || !token) {
      return res.status(400).json({ error: 'tempToken and token are required' });
    }
    
    let decoded;
    try {
      decoded = jwt.verify(tempToken, JWT_SECRET);
      if (!decoded.isTemp) throw new Error();
    } catch {
      return res.status(401).json({ error: 'Invalid or expired temporary token' });
    }
    
    const user = await User.findById(decoded.userId);
    if (!user || !user.isTwoFactorEnabled) {
      return res.status(401).json({ error: '2FA is not enabled for this user' });
    }
    
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token
    });
    
    if (!verified) {
      return res.status(401).json({ error: 'Invalid 2FA token' });
    }
    
    const finalToken = jwt.sign(
      { userId: user._id, role: user.role, email: user.email, username: user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    publishEvent('user.login', {
      userId: user._id,
      username: user.username,
      role: user.role
    });

    res.json({
      token: finalToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const requesterRole = req.user.role;

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!canManageRole(requesterRole, targetUser.role)) {
      return res.status(403).json({ error: `Access denied. Role '${requesterRole}' cannot reset password for role '${targetUser.role}'.` });
    }

    // Generate a secure temporary password
    const tempPassword = crypto.randomBytes(8).toString('hex');
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    targetUser.password = hashedPassword;
    // Optional: flag the user to reset password on next login, if we had such a field.
    await targetUser.save();

    publishEvent('user.password_reset', {
      userId: targetUser._id,
      username: targetUser.username,
      role: targetUser.role,
      resetBy: req.user.userId
    });

    res.json({ 
      message: 'Password reset successfully',
      temporaryPassword: tempPassword // Provide exactly once to the admin
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
