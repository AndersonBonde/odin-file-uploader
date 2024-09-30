const { Router } = require('express');
const indexController = require('../controllers/indexController');

const router = new Router();

router.get('/', indexController.index);
router.get('/signup', indexController.signUpGet);
router.post('/signup', indexController.signUpPost);
router.get('/login', indexController.loginGet);
router.post('/login', indexController.loginPost);
router.get('/logout', indexController.logoutGet);
router.get('/upload/:id', indexController.uploadGet);
router.post('/upload/:id', indexController.uploadPost);
router.get('/folder/create/:id', indexController.folderCreateGet);
router.post('/folder/create/:id', indexController.folderCreatePost);

module.exports = router;
