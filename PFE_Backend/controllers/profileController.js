const User = require("../models/User");
const bcrypt = require("bcryptjs");
const asyncHandler = require("../middlewares/async");
const ErrorResponse = require("../utils/errorResponse");

// @desc    Get current user profile
// @route   GET /api/v1/profile/me
// @access  Private
exports.getMyProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc    Update user profile
// @route   PUT /api/v1/profile/update
// @access  Private
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

// @desc    Update password
// @route   PUT /api/v1/profile/updatepassword
// @access  Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return next(new ErrorResponse("Le mot de passe actuel est incorrect", 401));
  }

  // Check new password match
  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(
      new ErrorResponse("Les mots de passe ne correspondent pas", 400)
    );
  }

  user.password = req.body.newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    data: { id: user._id },
  });
});
