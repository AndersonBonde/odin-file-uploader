const { body, validationResult } = require('express-validator');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const prisma = require('../database/prisma');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const index = async (req, res) => {
  let user = undefined;
  let folder = undefined;
  
  if (req.user) {
    user = await prisma.user.findUnique({
      where: { email: req.user.email },
      include: { mainFolder: true },
    });

    folder = await prisma.folder.findUnique({
      where: { name: 'main', userId: req.user.id },
      include: { files: true, folders: true },
    });
  }

  res.render('index', {
    title: 'Index page',
    user: user,
    folder: folder,
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
            mainFolder: {
              create: { name: 'main' },
            }
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

const uploadGet = (req, res) => {
  if (!req.user) res.redirect('/');

  console.log(req.params);

  res.render('upload_form', {
    title: 'Upload a file',
  });
};

// TODO upload should require a route :id
const uploadPost = [
  upload.single('file'),
  async (req, res) => {  
    const folder = await prisma.folder.findUnique({
      where: {
        name: 'main',
        userId: req.user.id,
      }
    });

    const file = await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        folderId: folder.id,
      }
    });

    res.redirect('/');
  }
];

const folderCreateGet = async (req, res) => {
  const folder = { id: req.params.id };
    
  res.render('folder_form', {
    title: 'Create a folder',
    folder: folder,
  });
};

const folderCreatePost = [
  body('name').trim()
    .isLength({ min: 1 }).withMessage('Please give your new folder a name'),
  async (req, res) => {
    const errors = validationResult(req);
    const folder = { id: req.params.id, name: req.body.name };

    if (!errors.isEmpty()) {
      res.render('folder_form', {
        title: 'Create a folder',
        folder: folder,
        errors: errors.array(),
      })
    } else {
      const newFolder = await prisma.folder.update({
        where: { id: req.params.id },
        data: {
          folders: {
            create: {
              name: req.body.name,
              parentId: +req.params.id,
              userId: +req.user.id,
            }
          }
        }
      });
      console.log(newFolder);
    
      res.redirect('/');
    }
  }
];


module.exports = {
  index,
  signUpGet,
  signUpPost,
  loginGet,
  loginPost,
  logoutGet,
  uploadGet,
  uploadPost,
  folderCreateGet,
  folderCreatePost,  
}
