const { body } = require("express-validator");

const signupValidate = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("First name is required")
    .isLength({ max: 80 })
    .withMessage("First name must be no more than 80 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Last name is required")
    .isLength({ max: 80 })
    .withMessage("Last name must be no more than 80 characters"),
  body("username")
    .trim()
    .toLowerCase()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters")
    .isLength({ max: 254 })
    .withMessage("Username must be no more than 254 characters")
    .matches(/^[a-z0-9._@+-]+$/)
    .withMessage("Enter a valid username or email address"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("Password must be no more than 72 bytes"),
  body("confirmPassword")
    .custom((value, { req }) => value === req.body.password)
    .withMessage("Passwords do not match"),
];

const messageValidate = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Title is required")
    .isLength({ max: 120 })
    .withMessage("Title must be no more than 120 characters"),
  body("text")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Message text is required")
    .isLength({ max: 10000 })
    .withMessage("Message must be no more than 10,000 characters"),
];

module.exports = { signupValidate, messageValidate };