const router = require('express').Router();
const { seguro } = require('./util');
const panel = require('../services/panel.service');
router.get('/', seguro(async (req, res) => res.render('reportes', { d: await panel.resumen() })));
module.exports = router;
