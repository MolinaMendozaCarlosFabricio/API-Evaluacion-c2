const express = require('express');
const router = express.Router();
const comentariosControllers = require('../controllers/comentarios');

router.post('/comment', comentariosControllers.addComment);
router.get('/', comentariosControllers.seeComments);
router.put('/update/:id', comentariosControllers.editComment);
router.delete('/delete/:id', comentariosControllers.deleteComment);

module.exports = router;