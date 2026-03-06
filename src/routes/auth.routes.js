const express = require("express");
const router = express.Router();
const userModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.create({
    username,
    password,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token);
  res.status(201).json({
    message: "User registered successfully",
    user,
  });
});

router.get("/user", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel
      .findOne({
        _id: decoded.id,
      })
      .select("-password -__v");

    // res.send(decoded);
    res.status(200).json({
      message: "User data fetched",
      user,
    });
  } catch (err) {
    return res.status(401).json({
      message: "Unauthorized Toekn",
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await userModel.findOne({
    username: username,
  });
  if (!user) {
    return res.status(401).json({
      message: "Invalid Username",
    });
  }
  const isPasswordValid = password == user.password;
  if (!isPasswordValid) {
    return res.status(401).json({
      message: "Invalid Password",
    });
  }
  res.status(200).json({
    message: "User Loggedin successfully",
  });
});

module.exports = router;
