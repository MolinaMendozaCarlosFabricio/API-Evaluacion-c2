const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnos');

router.post('/register', alumnoController.addAlumno);
router.get('/login', alumnoController.login);
router.get('/', alumnoController.seeAlumnos);
router.put('/update/:id', alumnoController.updateAlumno);
router.delete('/delete/:id', alumnoController.deleteAlumno);

module.exports = router;