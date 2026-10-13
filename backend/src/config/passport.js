const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

const setupGoogleStrategy = (id, secret) => {
  const clientID = id || process.env.GOOGLE_CLIENT_ID || "placeholder-google-client-id";
  const clientSecret = secret || process.env.GOOGLE_CLIENT_SECRET || "placeholder-google-client-secret";

  const callbackURL =
    process.env.GOOGLE_CALLBACK_URL ||
    (process.env.BACKEND_URL
      ? `${process.env.BACKEND_URL.replace(/\/$/, "")}/api/auth/google/callback`
      : "http://localhost:5000/api/auth/google/callback");

  passport.use(
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );
};

setupGoogleStrategy();

module.exports = { passport, setupGoogleStrategy };

