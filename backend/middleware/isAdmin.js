exports.isAdmin = (req, res, next) => {

  if (!req.user || !req.user.role === "admin") {
    return res.status(403).json({
      success: false,
      data: null,
      message: "Access Denied. Admins Only."
    });
  }
  next();
};