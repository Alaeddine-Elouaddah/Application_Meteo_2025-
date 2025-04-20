const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");

exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  const fieldsToUpdate = {
    username: req.body.username,
    email: req.body.email,
    service: req.body.service,
  };

  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Vérifie le mot de passe actuel
  const isMatch = await bcrypt.compare(req.body.currentPassword, user.password);
  if (!isMatch) {
    return next(new ErrorResponse("Le mot de passe actuel est incorrect", 401));
  }

  // Vérifie la correspondance du nouveau mot de passe
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorResponse("Les mots de passe ne correspondent pas", 400)
    );
  }

  // Hacher le nouveau mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.newPassword, salt);

  // Mettre à jour le mot de passe haché
  user.password = hashedPassword;
  await user.save({ validateBeforeSave: false }); // évite les erreurs de validation inutiles

  res.status(200).json({
    success: true,
    data: { id: user._id },
  });
});
