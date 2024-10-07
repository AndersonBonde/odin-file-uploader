const { Router } = require('express');
const folderController = require('../controllers/folderController');

const router = new Router();

router.get('/upload/:id', folderController.uploadToFolderGet);
router.post('/upload/:id', folderController.uploadToFolderPost);
router.get('/create', folderController.createFolderOnUserGet);
router.post('/create', folderController.createFolderOnUserPost);
router.get('/create/:id', folderController.createFolderOnFolderGet);
router.post('/create/:id', folderController.createFolderOnFolderPost);
router.get('/update/:id', folderController.updateFolderGet);
router.post('/update/:id', folderController.updateFolderPost);
// TODO delete folder
router.get('/:id', folderController.folderGet);

module.exports = router;
