const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");

passport.use(new LocalStrategy(
  { usernameField: "username", passwordField: "password" },
  async (username, password, done) => {
    try {
      const user = await userModel.findUserByUsername(username.trim().toLowerCase());
      if (!user) {
        return done(null, false);
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false);
      }
      const { password: passwordHash, ...safeUser } = user;
      return done(null, safeUser);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userModel.findUserById(id);
    done(null, user || false);
  } catch (error) {
    done(error);
  }
});

module.exports = passport;