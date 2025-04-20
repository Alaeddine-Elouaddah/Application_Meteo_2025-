const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  updatePassword,
} = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.put("/updatepassword", updatePassword);

module.exports = router;
