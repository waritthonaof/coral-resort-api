exports.getLodgingUserIds = (req, res, next) => {
  if (!req.body.lodging) req.body.lodging = req.params.lodgingId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};
