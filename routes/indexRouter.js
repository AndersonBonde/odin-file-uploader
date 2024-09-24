const { Router } = require('express');
const indexController = require('../controllers/indexController');

const router = new Router();

router.get('/', indexController.index);
router.get('/signup', indexController.signUpGet);
router.post('/signup', indexController.signUpPost);
router.get('/login', indexController.loginGet);
router.post('/login', indexController.loginPost);
// TODO logout

module.exports = router;
