const express = require('express');
const { check } = require('express-validator');

// Controllers
const Auth = require('../controllers/auth');
const Password = require('../controllers/password');

// Middlewares
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({ message: "You are in the Auth Endpoint. Register or Login to test Authentication." });
});

router.post('/register', [
  check('email').isEmail().withMessage('Enter a valid email address'),
  check('username').not().isEmpty().withMessage('You username is required'),
  check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
  check('firstName').not().isEmpty().withMessage('You first name is required'),
  check('lastName').not().isEmpty().withMessage('You last name is required')
], validate, Auth.register);

router.post("/login", [
  check('email').isEmail().withMessage('Enter a valid email address'),
  check('password').not().isEmpty(),
], validate, Auth.login);

router.get('/verify/:token', Auth.verify);

router.post('/resend', Auth.resendToken);

router.post('/recover', [
  check('email').isEmail().withMessage('Enter a valid email address'),
], validate, Password.recover);

router.post('/reset/:token', [
  check('password').not().isEmpty().isLength({ min: 6 }).withMessage('Must be at least 6 chars long'),
  check('password_confirmation', 'Passwords do not match').custom((value, { req }) => (value === req.body.password)),
], validate, Password.resetPassword);

module.exports = router;
