const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

router.post("/register", register);
// router.post("/login", login);
router.post("/login", (req, res) => {
  console.log("LOGIN API HIT");
  login(req, res);
});
module.exports = router;
