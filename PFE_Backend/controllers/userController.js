const User = require("../models/User");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
// Utility function to filter object fields
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// Get all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-__v -password");

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
  const user = await User.findById(req.params.id).select("-__v -password");

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
    "name",
    "email",
    "password",
    "role",
    "supervisor"
  );

  // If role is Stagiaire, require supervisor
  if (filteredBody.role === "Stagiaire" && !filteredBody.supervisor) {
    return next(new AppError("Supervisor is required for interns", 400));
  }

  const newUser = await User.create(filteredBody);

  // Remove password from output
  newUser.password = undefined;

  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// Update user (for admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  // 1) Filter out unwanted fields
  const filteredBody = filterObj(
    req.body,
    "name",
    "email",
    "password",
    "role",
    "supervisor"
  );

  // 2) If password is provided, it will be hashed by the pre-save middleware
  // 3) If role is Stagiaire, require supervisor
  if (filteredBody.role === "Stagiaire" && !filteredBody.supervisor) {
    return next(new AppError("Supervisor is required for interns", 400));
  }

  // 4) Update user
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    filteredBody,
    {
      new: true,
      runValidators: true,
    }
  ).select("-__v -password");

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
  const collaborators = await User.find({ role: "Collaborateur" }).select(
    "name email"
  );

  res.status(200).json({
    status: "success",
    results: collaborators.length,
    data: {
      collaborators,
    },
  });
});
