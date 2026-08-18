const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: '/api/auth/google/callback'
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user already exists
      let user = await User.findOne({ googleId: profile.id });
      if (user) {
        return done(null, user);
      }
      
      // Match by email if googleId not found
      if (profile.emails && profile.emails.length > 0) {
        const email = profile.emails[0].value;
        user = await User.findOne({ email });
        if (user) {
          user.googleId = profile.id;
          await user.save();
          return done(null, user);
        }
      }

      // Create new user (default to student)
      user = new User({
        username: profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 1000),
        email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : `${profile.id}@google.com`,
        googleId: profile.id,
        role: 'student',
        isTwoFactorEnabled: false
      });
      await user.save();
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

module.exports = passport;
