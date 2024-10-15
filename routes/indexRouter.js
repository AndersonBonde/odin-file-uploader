const { Router } = require('express');
const indexController = require('../controllers/indexController');

const router = new Router();

router.get('/', indexController.index);
router.get('/signup', indexController.signUpGet);
router.post('/signup', indexController.signUpPost);
router.get('/login', indexController.loginGet);
router.post('/login', indexController.loginPost);
router.get('/logout', indexController.logoutGet);
router.get('/upload', indexController.uploadToUserGet);
router.post('/upload', indexController.uploadToUserPost);
router.get('/file/delete/:id', indexController.fileDeleteGet);
router.get('/file/:id', indexController.fileGet);
router.get('/download/:id', indexController.downloadGet);

module.exports = router;
