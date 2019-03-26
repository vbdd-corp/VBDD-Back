const { Router } = require('express');
const LoginRouter = require('./login');

const router = new Router();
router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/login', LoginRouter);


module.exports = router;
