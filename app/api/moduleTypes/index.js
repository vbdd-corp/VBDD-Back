const { Router } = require('express');
const { ModuleType } = require('../../models');

const router = new Router();


router.get('/', (req, res) => {
  try {
    res.status(200).json(ModuleType.get());
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
