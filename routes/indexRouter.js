const { Router } = require('express');
const indexController = require('../controllers/indexController');

const router = new Router();

router.get('/', indexController.index);
// TODO signup, login, logout

module.exports = router;
