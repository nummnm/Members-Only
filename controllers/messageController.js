const { validationResult } = require("express-validator");
const messageModel = require("../models/messageModel");

async function getHome(req, res) {
  const messages = await messageModel.findAllMessages();
  const canViewAuthors = Boolean(
    req.user && (req.user.membership_status || req.user.is_admin)
  );
  res.render("index", { user: req.user, messages, canViewAuthors });
}

async function getMessage(req, res) {
  const messageId = Number(req.params.messageId);
  if (!Number.isSafeInteger(messageId) || messageId < 1) {
    return res.status(404).send("Message not found.");
  }
  const message = await messageModel.findMessageById(messageId);
  if (!message) return res.status(404).send("Message not found.");

  const canViewAuthors = Boolean(
    req.user && (req.user.membership_status || req.user.is_admin)
  );
  res.render("message", { user: req.user, message, canViewAuthors });
}

function getNewMessage(req, res) {
  res.render("new-message", { errors: [], formData: {} });
}

async function postNewMessage(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("new-message", {
      errors: errors.array(),
      formData: req.body,
    });
  }
  await messageModel.createMessage(req.user.id, req.body.title, req.body.text);
  res.redirect("/");
}

async function postDeleteMessage(req, res) {
  const messageId = Number(req.params.messageId);
  if (!Number.isSafeInteger(messageId) || messageId < 1) {
    return res.status(400).send("Invalid message id.");
  }
  const deleted = await messageModel.deleteMessage(messageId);
  if (!deleted) return res.status(404).send("Message not found.");
  res.redirect("/");
}

module.exports = { getHome, getMessage, getNewMessage, postNewMessage, postDeleteMessage };