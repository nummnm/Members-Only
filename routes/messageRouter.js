const express = require("express");
const messageController = require("../controllers/messageController");
const { messageValidate } = require("../middleware/validation");
const {
  ensureAuthenticated,
  ensureAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", messageController.getHome);
router.get("/messages/new", ensureAuthenticated, messageController.getNewMessage);
router.post(
  "/messages/new",
  ensureAuthenticated,
  messageValidate,
  messageController.postNewMessage
);
router.get("/messages/:messageId", messageController.getMessage);
router.post(
  "/messages/:messageId/delete",
  ensureAuthenticated,
  ensureAdmin,
  messageController.postDeleteMessage
);

module.exports = router;