const express = require("express");
const {
  homePage,
  forgotPassword,
  userSignin,
  userSignout,
  userSignup,
  verifyAccount,
  resetPassword,
} = require("../controllers/userControllers");
const { isAuthenticated } = require("../middlewares/auth");

const router = express.Router();

router.get("/", homePage);
router.post("/user/signup", userSignup);
router.get("/verify/:id", verifyAccount);
router.post("/user/signin", userSignin);
router.get("/user/signout", userSignout);
router.post("/forgot/password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

module.exports = router;
