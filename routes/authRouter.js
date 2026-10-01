const express = require("express");
const passport = require("../config/passport");

const router = express.Router();

const authController = require("../controllers/authController");
const { signupValidate } = require("../middleware/validation");

router.get("/signup", authController.getSignup);
router.post("/signup", signupValidate, authController.postSignup);
router.get("/login", authController.getLogin);
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login?error=1" }),
  authController.postLogin
);
router.post("/logout", authController.postLogout);

module.exports = router;