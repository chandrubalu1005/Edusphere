const express = require('express');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const passport = require('passport');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authMiddleware, authController.me);

// 2FA Routes
router.post('/setup-2fa', authMiddleware, authController.setup2FA);
router.post('/verify-2fa', authMiddleware, authController.verify2FA);
router.post('/login-2fa', authController.login2FA);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    // Issue token and redirect
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey123';
    
    if (req.user.isTwoFactorEnabled) {
      const tempToken = jwt.sign(
        { userId: req.user._id, role: req.user.role, email: req.user.email, username: req.user.username, isTemp: true },
        JWT_SECRET,
        { expiresIn: '5m' }
      );
      return res.redirect(`/login/2fa?token=${tempToken}`);
    }

    const token = jwt.sign(
      { userId: req.user._id, role: req.user.role, email: req.user.email, username: req.user.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.redirect(`/oauth-callback?token=${token}`);
  }
);

module.exports = router;
