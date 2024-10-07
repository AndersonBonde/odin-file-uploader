const { body, validationResult } = require('express-validator');
const prisma = require('../database/prisma');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const uploadToFolderGet = (req, res) => {
  res.render('upload_form', {
    title: 'Upload a file'
  });
};

const uploadToFolderPost = [
  upload.single('file'),
  async (req, res) => {
    await prisma.file.create({
      data: {
        name: req.file.originalname,
        size: req.file.size,
        url: req.file.path,
        folderId: +req.params.id
      }
    });
  
    res.redirect(`/folder/${req.params.id}`);
  }
]

const createFolderOnUserGet = async (req, res) => {
  res.render('folder_form', {
    title: 'Create a folder',
  });
};

const createFolderOnUserPost = [
  body('name').trim()
    .isLength({ min: 1 }).withMessage('Please give your new folder a name'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('folder_form', {
        title: 'Create a folder',
        errors: errors.array(),
      })
    } else {
      await prisma.folder.create({
        data: {
          name: req.body.name,
          userId: req.user.id
        }
      });
    
      res.redirect('/');
    }
  }
];

const createFolderOnFolderGet = async (req, res) => {
  res.render('folder_form', {
    title: 'Create a folder'
  })
};

const createFolderOnFolderPost = [
  body('name').trim()
    .isLength({ min: 1 }).withMessage('Please give your new folder a name'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('folder_form', {
        title: 'Create a folder',
        errors: errors.array(),
      })
    } else {
      await prisma.folder.create({
        data: {
          name: req.body.name,
          parentId: +req.params.id
        }
      });
    
      res.redirect(`/folder/${req.params.id}`);
    }
  }
];

const folderGet = async (req, res) => {
  const folder = await prisma.folder.findUnique({
    where: { id: +req.params.id },
    include: { files: true, folders: true }
  });
  
  res.render('folder', {
    title: folder.name,
    folder: folder,
    user: req.user
  });
}

const updateFolderGet = (req, res) => {
  res.render('folder_form', {
    title: 'Rename folder'
  });
};

const updateFolderPost = [
  body('name').trim()
    .isLength({ min: 1 }).withMessage('Please give your new folder a name'),
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.render('folder_form', {
        title: 'Rename folder',
        errors: errors.array(),
      })
    } else {
      await prisma.folder.update({
        where: {
          id: +req.params.id
        },
        data: {
          name: req.body.name
        }
      });
    
      res.redirect(`/folder/${req.params.id}`);
    }

  }
];

module.exports = {
  uploadToFolderGet,
  uploadToFolderPost,
  createFolderOnUserGet,
  createFolderOnUserPost,  
  createFolderOnFolderGet,
  createFolderOnFolderPost,
  folderGet,
  updateFolderGet,
  updateFolderPost,
}