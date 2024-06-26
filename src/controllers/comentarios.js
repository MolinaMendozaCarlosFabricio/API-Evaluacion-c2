const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

db.connect((err) => {
  if (err) throw err;
  console.log('Acceso al modulo de comentarios');
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(403);
        }
        req.user = user;
        next();
      });
    } else {
      res.sendStatus(401);
    }
};

exports.addComment = [authenticateJWT ,(req, res) => {
    let {id, titulo, contenido, id_estudiantes} = req.body;

    db.query('INSERT INTO Comentarios VALUES (?, ?, ?, ?);',
        [id, titulo, contenido, id_estudiantes],
        (err, result) => {
            if(err){
                res.status(500).send('Error al crear comentario');
                throw err;
            }
            res.send('Comentario publicado');
        }
    );
}];

exports.seeComments = [authenticateJWT, (req, res) => {
    db.query('SELECT * FROM Comentarios;',
        (err, result) => {
            if(err){
                res.status(500).send('Error al mostrar los comentarios');
                throw err;
            }
            res.json(result);
        }
    );
}];

exports.editComment = [authenticateJWT, (req, res) => {
    const commentId = req.params.id;
    const updateTittle = req.body.titulo;
    let updateContent = req.body.contenido;
    db.query(`UPDATE Comentarios SET titulo = ?, contenido = ? WHERE id = ?`,
        [updateTittle, updateContent, commentId],
        (err, result) => {
            if (err) {
                console.error('Error al actualizar el comentario:', err);
                res.status(500).send('Error al actualizar el comentario');
                return;
            }
            res.send('Comentario actualizado');
        }
    );
}];

exports.deleteComment = [authenticateJWT, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM Comentarios WHERE id = ?', [userId], (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el comentario');
        throw err;
      }
      res.send('Comentario eliminado correctamente');
    });
}];