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
  const { email } = req.body;

  // 1. Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("Cet email est déjà utilisé", 400));
  }

  // 2. Filtrer les données
  const filteredBody = filterObj(req.body, "username", "email", "password");

  // 3. Forcer le rôle user et hash le mot de passe
  filteredBody.role = "user";
  if (filteredBody.password) {
    filteredBody.password = await bcrypt.hash(filteredBody.password, 12);
  }
  filteredBody.isVerified = true;

  // 4. Créer l'utilisateur
  const newUser = await User.create(filteredBody);

  // 5. Nettoyer les données sensibles
  newUser.password = undefined;
  newUser.verificationCode = undefined;
  newUser.resetCode = undefined;
  newUser.resetCodeExpires = undefined;

  // 6. Envoyer la réponse
  res.status(201).json({
    status: "success",
    data: {
      user: newUser,
    },
  });
});

// Nouvelle fonction pour vérifier l'email
exports.checkEmail = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.params.email });
  if (user) {
    return res.status(400).json({
      status: "fail",
      message: "Email déjà utilisé",
    });
  }
  res.status(200).json({
    status: "success",
    message: "Email disponible",
  });
});

// Update user (for admin)
exports.updateUser = catchAsync(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    "username",
    "email",
    "password",
    "role"
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
  const { active } = req.body;

  // Ajoutez des logs pour le débogage
  console.log("Received request to update active status:", {
    userId: req.params.id,
    activeStatus: active,
    requesterId: req.user.id,
  });

  if (typeof active !== "boolean") {
    console.error("Invalid active status type:", typeof active);
    return next(
      new AppError("Please provide a valid active status (true/false)", 400)
    );
  }

  try {
    // Empêcher un admin de se désactiver lui-même
    if (req.params.id === req.user.id && !active) {
      console.warn("Admin attempted to deactivate themselves");
      return next(new AppError("You cannot deactivate your own account", 403));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: active },
      { new: true }
    ).select("-password -__v -verificationCode -resetCode");

    if (!user) {
      console.error("User not found with ID:", req.params.id);
      return next(new AppError("No user found with that ID", 404));
    }

    console.log("Successfully updated user status:", {
      userId: user._id,
      newStatus: user.isActive,
    });

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
  } catch (error) {
    console.error("Error in updateUserActiveStatus:", error);
    next(error); // Transmettez l'erreur au middleware de gestion des erreurs
  }
});
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "Utilisateur non trouvé",
      });
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "error",
      message: err.message,
    });
  }
};
