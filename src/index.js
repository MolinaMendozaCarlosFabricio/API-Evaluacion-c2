const express = require('express');
const bodyParser = require('body-parser');
const alumnosRoutes = require('./routes/alumnos');
const comentariosRoutes = require('./routes/comentarios');
require('dotenv').config();
const app = express();
const port = process.env.DB_PORT || 3000;

app.use(bodyParser.json());

app.use('/alumnos', alumnosRoutes);
app.use('/comentarios', comentariosRoutes);

app.listen(port, () => {
    console.log(`Servidor en linea`);
})