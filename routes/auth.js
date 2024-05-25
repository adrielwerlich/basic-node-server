const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");

const router = express.Router();

router.get("/login", authController.getLogin);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Please enter a valid email address."),
    body("password", "Password has to be valid.").isLength({ min: 5 }),
  ],
  authController.postLogin
);

router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Enter valid email"),
    body("password", "Password should have at least 5 chars")
      .isLength({ min: 5 })
      .withMessage("Enter valid email"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords have to match");
      }
      return true;
    }),
  ],
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
