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
  console.log('Acceso al modulo de alumnos');
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

exports.addAlumno = [ (req, res) => {
    let {id, nombre, apellido, password} = req.body;
  
    bcrypt.hash(password, 5, (err, hash) => { 
      if (err) {
        res.status(500).send('Error en el hasheo');
        throw err;
      }
      password = hash;
  
      db.query('INSERT INTO Estudiantes VALUES (?, ?, ?, ?);', 
                   [id, nombre, apellido, password], (err, result) => {
              if (err) {
                  console.error('Error al agregar el Alumno:', err);
                  return res.status(500).send('Error al agregar el Alumno');
              }
              res.status(201).send('Alumno agregado correctamente');
      });
    });
}];

exports.login = async (req, res) => {
    const { nombre, password } = req.body;
    db.query('SELECT * FROM Estudiantes WHERE nombre = ?', [nombre], async (err, result) => {
      if (err) {
        res.status(500).send('Error en el servidor');
        throw err;
      }
      if (result.length === 0) {
        return res.status(401).send('Sin coincidencias');
      }
      const user = result[0];
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).send('Credenciales inválidas');
      }
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '5h' });
      res.json({ token });
    });
};

exports.seeAlumnos = [authenticateJWT, (req, res) => {
  db.query('SELECT Estudiantes.id, Estudiantes.nombre, Estudiantes.apellido FROM Estudiantes;',
      (err, result) => {
          if(err){
              res.status(500).send('Error al mostrar los Estudiantes');
              throw err;
          }
          res.json(result);
      }
  );
}];

exports.updateAlumno = [authenticateJWT, (req, res) => {
    const userId = req.params.id;
    const updateFirstName= req.body.nombre;
    let updateLastName = req.body.password;
      db.query('UPDATE Estudiantes SET nombre = ?, apellido = ? WHERE id = ?', [updateFirstName, updateLastName, userId], (err, result) => {
        if (err) {
          console.error('Error al actualizar el alumno:', err);
          res.status(500).send('Error al actualizar el alumno');
          return;
        }
        
        if (result.affectedRows === 0) {
          res.status(404).send('Usuario no encontrado');
          return;
        }
  
        res.send('Datos del usuario actualizados correctamente');
      });
}];

exports.deleteAlumno = [authenticateJWT, (req, res) => {
    const userId = req.params.id;
    db.query('DELETE FROM Estudiantes WHERE id = ?', [userId], (err, result) => {
      if (err) {
        res.status(500).send('Error al eliminar el estudiante');
        throw err;
      }
      res.send('Estudiante eliminado correctamente');
    });
}];