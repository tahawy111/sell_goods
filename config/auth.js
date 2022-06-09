module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error_msg", "من فضلك سجل الدخول لتري هذا الموقع");
    res.redirect("/login");
  },
  forwardAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    res.redirect("/");
  },
  isAdmin: (req, res, next) => {
    if (req.user.manageAdmins) {
      return next();
    }
    res.redirect("/");
  },
};
