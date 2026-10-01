const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const userModel = require("../models/userModel");

function getSignup(req, res) {
  res.render("signup", { errors: [], formData: {} });
}

async function postSignup(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("signup", {
      errors: errors.array(),
      formData: req.body,
    });
  }

  const { firstName, lastName, username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  let user;
  try {
    user = await userModel.createUser(firstName, lastName, username, hashedPassword);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).render("signup", {
        errors: [{ msg: "That username is already registered" }],
        formData: req.body,
      });
    }
    throw error;
  }

  req.login(user, (error) => {
    if (error) return next(error);
    res.redirect("/");
  });
}

function getLogin(req, res) {
  res.render("login", {
    error: req.query.error === "1",
  });
}

function postLogin(req, res) {
  res.redirect("/");
}

function postLogout(req, res, next) {
  req.logout((error) => {
    if (error) return next(error);
    res.redirect("/");
  });
}

module.exports = { getSignup, postSignup, getLogin, postLogin, postLogout };