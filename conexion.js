const Sequelize = require('sequelize');
const modelos = require('./models/modelo');
require('dotenv').config();

const db = process.env.DB_MYSQL_REMOTO;
const usuario = process.env.USUARIO_MYSQL_REMOTO;
const password = process.env.PASSWORD_MYSQL_REMOTO;
const host = process.env.HOST_MYSQL_REMOTO;
const port = process.env.PORT_MYSQL_REMOTO;

const conexion = new Sequelize(db, usuario, password, {
  host: host,
  port: port,
  dialect: 'mysql',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // You may need to adjust this based on your setup
    },
  },
});

const { Usuario, Producto } = modelos(conexion);

// Sincroniza los modelos con la base de datos
conexion.sync({ force: false })
  .then(() => {
    console.log('Conectado a MySQL en PlanetScale y sincronizado con modelos');
  })
  .catch((err) => {
    console.log('Error al conectarse a MySQL:', err);
  });

module.exports = {
  Usuario: Usuario,
  Producto: Producto,
  conexion: conexion,
};
