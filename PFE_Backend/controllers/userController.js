const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const bcrypt = require("bcryptjs"); // ✅ Import du hash

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
    "role",
    "supervisor",
    "service"
  );

  if (
    !filteredBody.role ||
    !["admin", "collaborateur", "stagiaire"].includes(filteredBody.role)
  ) {
    filteredBody.role = "stagiaire";
  }

  if (filteredBody.role === "stagiaire" && !filteredBody.supervisor) {
    return next(new AppError("Supervisor is required for interns", 400));
  }

  // ✅ Hash du mot de passe
  if (filteredBody.password) {
    filteredBody.password = await bcrypt.hash(filteredBody.password, 12);
  }

  filteredBody.isVerified = true;

  const newUser = await User.create(filteredBody);

  // Supprimer infos sensibles
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
    "supervisor",
    "service",
    "isVerified"
  );

  if (filteredBody.role === "stagiaire" && !filteredBody.supervisor) {
    return next(new AppError("Supervisor is required for interns", 400));
  }

  // ✅ Hash du mot de passe si présent
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

// Get all collaborators (for supervisor selection)
exports.getCollaborators = catchAsync(async (req, res, next) => {
  const collaborators = await User.find({
    role: "collaborateur",
    isVerified: true,
  }).select("username email service");

  res.status(200).json({
    status: "success",
    results: collaborators.length,
    data: {
      collaborators,
    },
  });
});
