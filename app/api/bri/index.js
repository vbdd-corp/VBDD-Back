const { Router } = require('express');
const { Bri } = require('../../models');

const router = new Router();

const getBriById = function (briId) {
  return Bri.getById(briId);
};

const getBriByName = function (name) {
  return Bri.get().filter(
    student => student.mail.includes(name),
  );
};

router.get('/', (req, res) => res.status(200).json(Bri.get()));
router.get('/by-name/:BriName', (req, res) => res.status(200).json(getBriByName(req.params.BriName)));

router.get('/:BriID', (req, res) => {
  try {
    res.status(200).json(getBriById(req.params.BriID));
  } catch (err) {
    if (err.name === 'NotFoundError') {
      res.status(404).end();
    } else {
      res.status(500).json(err);
    }
  }
});

/* éventuellement faire méthode put */

/* ce post fonctionne mais l'id est rempli automatiquement par BaseModel
* probablement avec la date courante au lieu du plus petit id possible. */
router.post('/', (req, res) => {
  try {
    const oneBri = Bri.create(req.body);
    res.status(201).json(oneBri);
  } catch (err) {
    if (err.name === 'ValidationError') {
      res.status(400).json(err.extra);
    } else {
      res.status(500).json(err);
    }
  }
});

module.exports = router;
