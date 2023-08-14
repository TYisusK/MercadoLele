var express = require('express');
var path = require('path');
var usuariosRutas = require('./routes/usuarios');
var cookieSession = require('cookie-session');
var multer = require('multer'); // Importa la biblioteca multer
const { conexion } = require('./conexion'); // Importa la conexión

require('dotenv').config();

var app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.use('/web', express.static(path.join(__dirname, 'web')));
app.use('/uploads', express.static(path.join(__dirname, 'web/uploads')));

app.use(express.urlencoded({ extended: true }));
// Define la variable global para la ruta base
global.appRoot = path.resolve(__dirname);

app.use(cookieSession({
  name: 'session',
  secret: 'tu_secreto_aqui',
  maxAge: 24 * 60 * 60 * 1000, // Tiempo de vida de la sesión en milisegundos (por ejemplo, 1 día)
}));
app.use('/', usuariosRutas);

var port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log('Servidor en http://localhost:' + port);
});
