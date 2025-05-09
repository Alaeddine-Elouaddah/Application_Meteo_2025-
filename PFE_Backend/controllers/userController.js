const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs");

// Utility function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users (excluding admin)
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ role: { $ne: "admin" } }).select(
    "-__v -password -verificationCode -resetCode -resetCodeExpires"
  );

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Get single user
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "-__v -password -verificationCode -resetCode -resetCodeExpires"
  );

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

// Create user (for admin)
exports.createUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "password",
    "role"
  );

  // Set default role to 'user' if not provided or invalid
  if (!filteredBody.role || !["admin", "user"].includes(filteredBody.role)) {
    filteredBody.role = "user";
  }

  // Hash the password
  if (filteredBody.password) {
    filteredBody.password = await bcrypt.hash(filteredBody.password, 12);
  }

  filteredBody.isVerified = true;

  const newUser = await User.create(filteredBody);

  // Remove sensitive information
  newUser.password = undefined;
  newUser.verificationCode = undefined;
  newUser.resetCode = undefined;
  newUser.resetCodeExpires = undefined;

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// Update user (for admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "password",
    "role",
    "isVerified"
  );

  // Hash the password if present
  if (filteredBody.password) {
    filteredBody.password = await bcrypt.hash(filteredBody.password, 12);
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v -password -verificationCode -resetCode -resetCodeExpires");

  if (!updatedUser) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

// Delete user (for admin)
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// Get all users (for selection)
exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({
    role: "user",
    isVerified: true,
  }).select("username email");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
// Activer/Désactiver un utilisateur (Admin only)
exports.updateUserActiveStatus = catchAsync(async (req, res, next) => {
  const { active } = req.body; // Doit être un booléen

  // Validation
  if (typeof active !== "boolean") {
    return next(
      new AppError("Please provide a valid active status (true/false)", 400)
    );
  }

  // Empêcher un admin de se désactiver lui-même
  if (req.params.id === req.user.id && !active) {
    return next(new AppError("You cannot deactivate your own account", 403));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: active },
    { new: true }
  ).select("-password -__v -verificationCode -resetCode");

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user: {
        id: user._id,
        isActive: user.isActive,
        email: user.email,
        username: user.username,
        role: user.role,
      },
    },
    message: `User account has been ${
      user.isActive ? "activated" : "deactivated"
    } successfully`,
  });
});
