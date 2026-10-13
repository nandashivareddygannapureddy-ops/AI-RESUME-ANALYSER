const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User.model");

// In-memory fallback store when MongoDB is offline during local testing
const devMemoryUsers = new Map();

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET || "rozgaar_ai_secret_jwt_key_2026", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const isDbConnected = () => mongoose.connection.readyState === 1;

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const normalizedEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected, save in MongoDB
    if (isDbConnected()) {
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists)
        return res.status(400).json({ success: false, message: "Email already in use" });

      const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        lastLogin: new Date(),
        loginCount: 1,
      });
      const accessToken = generateToken(user._id.toString());

      return res.status(201).json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
        },
      });
    }

    // 2. Fallback memory store when MongoDB is offline
    if (devMemoryUsers.has(normalizedEmail)) {
      return res.status(400).json({ success: false, message: "Email already in use" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const fakeId = new mongoose.Types.ObjectId().toString();

    const memUser = {
      _id: fakeId,
      name,
      email: normalizedEmail,
      password: hashedPassword,
      avatar: "",
      profilePic: "",
      lastLogin: new Date(),
      loginCount: 1,
      createdAt: new Date(),
    };

    devMemoryUsers.set(normalizedEmail, memUser);
    devMemoryUsers.set(fakeId, memUser);

    console.warn("⚠️ MongoDB offline: User registered in local dev memory store.");
    const accessToken = generateToken(fakeId);

    return res.status(201).json({
      success: true,
      accessToken,
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        avatar: memUser.avatar,
        lastLogin: memUser.lastLogin,
        loginCount: memUser.loginCount,
      },
    });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: "All fields required" });

    const normalizedEmail = email.toLowerCase().trim();

    // 1. If MongoDB is connected
    if (isDbConnected()) {
      const user = await User.findOne({ email: normalizedEmail }).select("+password");
      if (!user)
        return res.status(401).json({ success: false, message: "Invalid email or password" });

      const match = await user.comparePassword(password);
      if (!match)
        return res.status(401).json({ success: false, message: "Invalid email or password" });

      // Record login in MongoDB
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save({ validateBeforeSave: false });

      const accessToken = generateToken(user._id.toString());

      return res.json({
        success: true,
        accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          lastLogin: user.lastLogin,
          loginCount: user.loginCount,
        },
      });
    }

    // 2. Fallback memory store when MongoDB is offline
    const memUser = devMemoryUsers.get(normalizedEmail);
    if (!memUser) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const match = await bcrypt.compare(password, memUser.password);
    if (!match) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    memUser.lastLogin = new Date();
    memUser.loginCount = (memUser.loginCount || 0) + 1;
    const accessToken = generateToken(memUser._id);

    return res.json({
      success: true,
      accessToken,
      user: {
        _id: memUser._id,
        name: memUser.name,
        email: memUser.email,
        avatar: memUser.avatar,
        lastLogin: memUser.lastLogin,
        loginCount: memUser.loginCount,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Process Google User profile/credentials and save to MongoDB (or memory store if offline)
const handleGoogleUser = async ({ googleId, name, email, avatar }) => {
  const normalizedEmail = (email || "").toLowerCase().trim();

  // 1. If MongoDB is connected, persist to MongoDB
  if (isDbConnected()) {
    let user = null;
    if (googleId) {
      user = await User.findOne({ googleId });
    }
    if (!user && normalizedEmail) {
      user = await User.findOne({ email: normalizedEmail });
    }

    if (user) {
      if (googleId) user.googleId = googleId;
      if (avatar && !user.avatar) user.avatar = avatar;
      if (avatar && !user.profilePic) user.profilePic = avatar;
      user.isVerified = true;
      user.lastLogin = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    } else {
      user = await User.create({
        googleId: googleId || `google_${Date.now()}`,
        name: name || "Google User",
        email: normalizedEmail,
        avatar: avatar || "",
        profilePic: avatar || "",
        isVerified: true,
        lastLogin: new Date(),
        loginCount: 1,
      });
    }

    const accessToken = generateToken(user._id.toString());
    return {
      accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
      },
    };
  }

  // 2. Fallback memory store when MongoDB is offline
  let memUser = devMemoryUsers.get(normalizedEmail) || devMemoryUsers.get(googleId);

  if (memUser) {
    memUser.googleId = googleId;
    if (avatar) memUser.avatar = avatar;
    memUser.lastLogin = new Date();
    memUser.loginCount = (memUser.loginCount || 0) + 1;
  } else {
    const fakeId = new mongoose.Types.ObjectId().toString();
    memUser = {
      _id: fakeId,
      googleId: googleId || `google_${Date.now()}`,
      name: name || "Google User",
      email: normalizedEmail,
      avatar: avatar || "",
      isVerified: true,
      lastLogin: new Date(),
      loginCount: 1,
      createdAt: new Date(),
    };
    devMemoryUsers.set(fakeId, memUser);
    if (normalizedEmail) devMemoryUsers.set(normalizedEmail, memUser);
    if (googleId) devMemoryUsers.set(googleId, memUser);
  }

  console.warn("⚠️ MongoDB offline: Google User saved in local dev memory store.");
  const accessToken = generateToken(memUser._id);
  return {
    accessToken,
    user: {
      _id: memUser._id,
      name: memUser.name,
      email: memUser.email,
      avatar: memUser.avatar,
      lastLogin: memUser.lastLogin,
      loginCount: memUser.loginCount,
    },
  };
};

// Direct / API Google authentication endpoint
const googleAuth = async (req, res) => {
  try {
    const { credential, profile } = req.body;

    let googleData = {
      googleId: "",
      name: "",
      email: "",
      avatar: "",
    };

    if (credential) {
      try {
        const payloadBase64 = credential.split(".")[1];
        const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8");
        const payload = JSON.parse(payloadJson);
        googleData = {
          googleId: payload.sub,
          name: payload.name || payload.given_name || "Google User",
          email: payload.email,
          avatar: payload.picture || "",
        };
      } catch (decodeErr) {
        return res.status(400).json({ success: false, message: "Invalid Google credential token" });
      }
    } else if (profile) {
      googleData = {
        googleId: profile.googleId || profile.id,
        name: profile.name || "Google User",
        email: profile.email,
        avatar: profile.avatar || profile.picture || "",
      };
    } else {
      return res.status(400).json({ success: false, message: "Google credential or profile is required" });
    }

    if (!googleData.email) {
      return res.status(400).json({ success: false, message: "Google profile must include an email address" });
    }

    const { user, accessToken } = await handleGoogleUser(googleData);

    res.json({
      success: true,
      accessToken,
      user,
    });
  } catch (err) {
    console.error("Google Auth Controller Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) return res.status(404).json({ success: false, message: "User not found" });
      return res.json({ success: true, user });
    }

    const memUser = devMemoryUsers.get(req.user.id);
    if (!memUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    return res.json({ success: true, user: memUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (isDbConnected()) {
      const user = await User.findByIdAndUpdate(
        req.user.id,
        { name: req.body.name, avatar: req.body.avatar },
        { new: true, runValidators: true }
      );
      return res.json({ success: true, user });
    }

    const memUser = devMemoryUsers.get(req.user.id);
    if (memUser) {
      if (req.body.name) memUser.name = req.body.name;
      if (req.body.avatar) memUser.avatar = req.body.avatar;
    }
    return res.json({ success: true, user: memUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, googleAuth, handleGoogleUser, getProfile, updateProfile };