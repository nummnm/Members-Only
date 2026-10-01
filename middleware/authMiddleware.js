function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect("/login");
}

function ensureMember(req, res, next) {
  if (req.user && (req.user.membership_status || req.user.is_admin)) {
    return next();
  }
  res.status(403).send("Club membership is required.");
}

function ensureAdmin(req, res, next) {
  if (req.user && req.user.is_admin) {
    return next();
  }
  res.status(403).send("Administrator access is required.");
}

module.exports = { ensureAuthenticated, ensureMember, ensureAdmin };