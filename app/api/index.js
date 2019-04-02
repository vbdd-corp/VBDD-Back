const { Router } = require('express');
const LoginRouter = require('./login');
const StudentRouter = require('./students');
const BriRouter = require('./bri');
const FileRouter = require('./file');

const router = new Router();
router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/login', LoginRouter);
router.use('/students', StudentRouter);
router.use('/bri', BriRouter);
router.use('/file', FileRouter);

module.exports = router;
