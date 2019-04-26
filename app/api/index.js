const { Router } = require('express');
const LoginRouter = require('./login');
const StudentRouter = require('./students');
const BriRouter = require('./bri');
const FileRouter = require('./file');
const ModuleRouter = require('./module').router;
const FileTypeRouter = require('./fileType');
const PlageRouter = require('./plage');
const CreneauRouter = require('./creneau');
const SchoolRouter = require('./school');

const router = new Router();
router.get('/status', (req, res) => res.status(200).json('ok'));
router.use('/login', LoginRouter);
router.use('/students', StudentRouter);
router.use('/bri', BriRouter);
router.use('/file', FileRouter);
router.use('/module', ModuleRouter);
router.use('/fileType', FileTypeRouter);
router.use('/plage', PlageRouter);
router.use('/creneau', CreneauRouter);
router.use('/school', SchoolRouter);

module.exports = router;
