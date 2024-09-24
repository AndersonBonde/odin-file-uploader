const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');

const index = (req, res) => {
  res.render('index', {
    title: 'Index page',
    user: req.user,
  });
};

const signUpGet = (req, res) => {
  res.render('signup_form', {
    title: 'Sign Up',
  });
};

const signUpPost = [
  body('firstname').trim()
    .isLength({ min: 1 }).withMessage('Your first name must not be empty'),
  body('lastname').trim()
    .isLength({ min: 1 }).withMessage('Your last name must not be empty'),
  body('email').trim()
    .custom(async (value) => {
      const user = await prisma.user.findUnique({
        where: {
          email: value,
        }
      });

      if (user) {
        throw new Error('Email already in use');
      }
    }),
  body('password').trim()
    .isLength({ min: 3 }).withMessage('Password minimum length is 3'),
  body('password_confirm').trim()
    .custom((value, { req }) => {
      return req.body.password === value;
    }).withMessage(`Your password and password confirmation value didn't match`),
  async (req, res, next) => {
    const errors = validationResult(req);
    const info = { firstname: req.body.firstname, lastname: req.body.lastname, email: req.body.email };

    if (!errors.isEmpty()) {
      res.render('signup_form', {
        title: 'Sign up',
        info: info,
        errors: errors.array(),
      });
    } else {
      bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
        if (err) next(err);

        await prisma.user.create({
          data: {
            email: req.body.email,
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            password: hashedPassword,
          }
        })
      });

      res.redirect('/');
    }
  }
];

const loginGet = (req, res) => {
  res.render('login_form', {
    title: 'Login',
  });
};

const loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true,
});

module.exports = {
  index,
  signUpGet,
  signUpPost,
  loginGet,
  loginPost,
}
