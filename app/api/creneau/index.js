const { Router } = require('express');
const { Creneau } = require('../../models');

const router = Router();

router.get('/', (req, res) => res.status(200).json(Creneau.get()));

module.exports = router;
