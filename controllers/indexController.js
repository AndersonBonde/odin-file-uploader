const fs = require('node:fs');
const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const { upload } = require('../config/multer.js');

const index = async (req, res) => {
  let user = undefined;
  
  if (req.user) {
    user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: { folders: true, files: true },
    });
  }

  res.render('index', {
    title: 'Index page',
    user: user
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
            password: hashedPassword
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
    errors: req.session.messages ? [{ msg: req.session.messages.at(-1) }] : [],
  });
};

const loginPost = passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureMessage: true,
});

const logoutGet = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }

    res.redirect('/');
  })
};

const uploadToUserGet = (req, res) => {
  if (!req.user) res.redirect('/');

  res.render('upload_form', {
    title: 'Upload a file',
  });
};

const uploadToUserPost = [
  upload.single('file'),
  async (req, res) => {  
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        userId: req.user.id,
      }
    });

    res.redirect('/');
  }
];

const fileGet = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: +req.user.id }
  });
  
  const file = await prisma.file.findUnique({
    where: { id: +req.params.id }
  });

  res.render('file', {
    title: file.name,
    user: user,
    file: file
  });
};

const fileDeleteGet = async (req, res) => {
  const deletedFile = await prisma.file.delete({
    where: { id: +req.params.id }
  });

  await fs.unlink(deletedFile.url, (err) => {
    if (err) throw new Error(`File path didn't exist.`);

    console.log(deletedFile.name + ' was deleted');
  });

  const path = deletedFile.folderId !== null
    ? `/folder/${deletedFile.folderId}`
    : '/';

  res.redirect(path);
};

const downloadGet = async (req, res) => {
  const file = await prisma.file.findUnique({
    where: { id: +req.params.id}
  });

  res.download(file.url);
};
  
module.exports = {
  index,
  signUpGet,
  signUpPost,
  loginGet,
  loginPost,
  logoutGet,
  uploadToUserGet,
  uploadToUserPost,
  fileGet,
  fileDeleteGet,
  downloadGet,
}
