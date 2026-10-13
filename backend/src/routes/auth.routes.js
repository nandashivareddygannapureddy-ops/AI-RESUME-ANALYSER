const express = require("express");
const passport = require("passport");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const { setupGoogleStrategy } = require("../config/passport");

const {
  register,
  login,
  googleAuth,
  handleGoogleUser,
  getProfile,
  updateProfile,
} = require("../controllers/auth.controller");

const { protect } = require("../middleware/auth.middleware");

// Standard Auth
router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Google Sign-In via POST (token / Google Identity Services)
router.post("/google", googleAuth);

// Google Sign-In status check
router.get("/google/status", (req, res) => {
  const hasCredentials = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    !process.env.GOOGLE_CLIENT_ID.startsWith("placeholder")
  );
  res.json({ success: true, hasCredentials });
});

// Configure Google OAuth credentials dynamically & save to .env
router.post("/google/credentials", (req, res) => {
  const { clientId, clientSecret } = req.body;
  if (!clientId || !clientSecret) {
    return res.status(400).json({ success: false, message: "clientId and clientSecret are required" });
  }

  process.env.GOOGLE_CLIENT_ID = clientId.trim();
  process.env.GOOGLE_CLIENT_SECRET = clientSecret.trim();

  // Persist to backend/.env
  try {
    const envPath = path.join(__dirname, "../../.env");
    if (fs.existsSync(envPath)) {
      let content = fs.readFileSync(envPath, "utf-8");
      content = content.replace(/#?\s*GOOGLE_CLIENT_ID=.*/g, `GOOGLE_CLIENT_ID=${clientId.trim()}`);
      content = content.replace(/#?\s*GOOGLE_CLIENT_SECRET=.*/g, `GOOGLE_CLIENT_SECRET=${clientSecret.trim()}`);
      if (!content.includes("GOOGLE_CLIENT_ID=")) {
        content += `\nGOOGLE_CLIENT_ID=${clientId.trim()}\nGOOGLE_CLIENT_SECRET=${clientSecret.trim()}\n`;
      }
      fs.writeFileSync(envPath, content, "utf-8");
    }
  } catch (fileErr) {
    console.error("Failed to write to .env:", fileErr.message);
  }

  // Reload passport strategy
  try {
    setupGoogleStrategy(clientId.trim(), clientSecret.trim());
  } catch (strategyErr) {
    console.error("Failed to reinitialize Google strategy:", strategyErr.message);
  }

  res.json({ success: true, message: "Google credentials saved and strategy updated!" });
});

// Google OAuth redirect routes
router.get(
  "/google",
  async (req, res, next) => {
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    
    // If real Google OAuth credentials are provided, use Passport OAuth2 flow with account selector
    if (
      process.env.GOOGLE_CLIENT_ID &&
      !process.env.GOOGLE_CLIENT_ID.startsWith("placeholder")
    ) {
      return passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
      })(req, res, next);
    }

    // Do NOT automatically log in as a hardcoded user! Redirect to frontend with account selector open
    return res.redirect(`${frontendUrl}/login?google_select=true`);
  }
);

router.get(
  "/google/callback",
  (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, profile) => {
      const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
      if (err || !profile) {
        console.error("Google Auth Passport Error:", err);
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }

      try {
        const email =
          profile.emails && profile.emails[0] ? profile.emails[0].value : "";
        const avatar =
          profile.photos && profile.photos[0] ? profile.photos[0].value : "";
        const name = profile.displayName || "Google User";
        const googleId = profile.id;

        const { accessToken } = await handleGoogleUser({
          googleId,
          name,
          email,
          avatar,
        });

        return res.redirect(`${frontendUrl}/auth-success?token=${accessToken}`);
      } catch (error) {
        console.error("Google Auth Callback Processing Error:", error);
        return res.redirect(`${frontendUrl}/login?error=auth_failed`);
      }
    })(req, res, next);
  }
);

module.exports = router;