const userModel = require("../models/userModel");

function getJoinClub(req, res) {
  res.render("join-club", { error: null });
}

async function postJoinClub(req, res, next) {
  const { password } = req.body;
  if (!process.env.CLUB_PASSWORD || password !== process.env.CLUB_PASSWORD) {
    return res.status(400).render("join-club", {
      error: "The passcode is incorrect or has not been configured.",
    });
  }
  const member = await userModel.makeMember(req.user.id);
  req.login(member, (error) => {
    if (error) return next(error);
    res.redirect("/");
  });
}

function getJoinAdmin(req, res) {
  if (req.user.is_admin) return res.redirect("/");
  res.render("join-admin", { error: null });
}

async function postJoinAdmin(req, res, next) {
  const { password } = req.body;
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
    return res.status(400).render("join-admin", {
      error: "The passcode is incorrect or has not been configured.",
    });
  }
  const admin = await userModel.makeAdmin(req.user.id);
  req.login(admin, (error) => {
    if (error) return next(error);
    res.redirect("/");
  });
}

module.exports = { getJoinClub, postJoinClub, getJoinAdmin, postJoinAdmin };