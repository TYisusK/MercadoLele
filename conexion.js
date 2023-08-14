const Sequelize = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
  dialect: 'mysql',  // Puedes ajustar esto según tu base de datos
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  // ... otras opciones de configuración
});

// Definición del modelo Producto
const Producto = sequelize.define('Producto', {
  // Definición de atributos del producto
  nombre: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  descripcion: {
    type: Sequelize.TEXT,
    allowNull: true,
  },
  // ... otros atributos
});

// Sincroniza el modelo con la base de datos (esto puede variar dependiendo de tu flujo de trabajo)
sequelize.sync().then(() => {
  console.log('Modelos sincronizados');
}).catch((error) => {
  console.error('Error al sincronizar modelos:', error);
});

// Exporta el modelo Producto y sequelize para su uso en otros módulos
module.exports = { Producto, sequelize };
