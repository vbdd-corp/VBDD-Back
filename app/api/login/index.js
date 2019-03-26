const { Router } = require('express');

const router = new Router();

router.get('/', (req, res) => res.status(200).json('ok login'));
/* router.post('/', (req, res) => {
}); */

module.exports = router;
