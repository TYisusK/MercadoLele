const Sequelize = require('sequelize');

module.exports = function(conexion) {
  // Modelo de Usuarios
  const Usuario = conexion.define('Usuario', {
    // Definición de atributos...
  });

  // Modelo de Productos
  const Producto = conexion.define('Producto', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fotoProducto: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    descripcion: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    precio: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    },
  });

  // No establecemos relaciones de clave foránea en este caso

  return {
    Usuario,
    Producto,
  };
};
