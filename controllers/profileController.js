const fs = require("node:fs/promises");
const path = require("node:path");
const userModel = require("../models/userModel");
const { uploadDirectory } = require("../middleware/profileUpload");

function getProfile(req, res) {
  const messages = {
    membership: "You left the club.",
    admin: "Admin access was removed.",
    avatar: "Profile icon updated.",
    avatarRemoved: "Profile picture removed.",
  };
  res.render("profile", {
    user: req.user,
    error: null,
    message: messages[req.query.updated] || null,
  });
}

async function removeLocalAvatar(profileIcon) {
  if (!profileIcon || !profileIcon.startsWith("/uploads/avatars/")) return;
  const filename = path.basename(profileIcon);
  try {
    await fs.unlink(path.join(uploadDirectory, filename));
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

async function postProfileIcon(req, res, next) {
  if (!req.file) return res.redirect("/profile");

  const profileIcon = `/uploads/avatars/${req.file.filename}`;
  try {
    const updatedUser = await userModel.updateProfileIcon(req.user.id, profileIcon);
    if (!updatedUser) throw new Error("Could not update profile icon.");

    const previousIcon = req.user.profile_icon;
    await removeLocalAvatar(previousIcon);
    req.login(updatedUser, (error) => {
      if (error) return next(error);
      res.redirect("/profile?updated=avatar");
    });
  } catch (error) {
    await removeLocalAvatar(profileIcon);
    next(error);
  }
}

async function postRemoveProfileIcon(req, res, next) {
  const previousIcon = req.user.profile_icon;
  const updatedUser = await userModel.updateProfileIcon(req.user.id, null);
  await removeLocalAvatar(previousIcon);
  req.login(updatedUser, (error) => {
    if (error) return next(error);
    res.redirect("/profile?updated=avatarRemoved");
  });
}

async function postLeaveClub(req, res, next) {
  const updatedUser = await userModel.leaveClub(req.user.id);
  req.login(updatedUser, (error) => {
    if (error) return next(error);
    res.redirect("/profile?updated=membership");
  });
}

async function postRemoveAdmin(req, res, next) {
  const updatedUser = await userModel.removeAdminRole(req.user.id);
  req.login(updatedUser, (error) => {
    if (error) return next(error);
    res.redirect("/profile?updated=admin");
  });
}

async function postDeleteAccount(req, res, next) {
  const profileIcon = req.user.profile_icon;
  const deleted = await userModel.deleteUser(req.user.id);
  if (!deleted) return res.status(404).send("Account not found.");

  await removeLocalAvatar(profileIcon);
  req.logout((logoutError) => {
    if (logoutError) return next(logoutError);
    req.session.destroy((sessionError) => {
      if (sessionError) return next(sessionError);
      res.clearCookie("connect.sid");
      res.redirect("/");
    });
  });
}

module.exports = {
  getProfile,
  postProfileIcon,
  postRemoveProfileIcon,
  postLeaveClub,
  postRemoveAdmin,
  postDeleteAccount,
};
