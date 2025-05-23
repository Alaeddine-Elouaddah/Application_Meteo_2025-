const express = require("express");
const router = express.Router();
const {
  getMyProfile,
  updateProfile,
  updatePassword,
  getDefaultCity,
  updateDefaultCity,
} = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

router.use(protect);

router.get("/me", getMyProfile);
router.put("/update", updateProfile);
router.put("/updatepassword", updatePassword);

router.route("/default-city").get(getDefaultCity).patch(updateDefaultCity);

module.exports = router;
