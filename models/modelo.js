const Sequelize = require('sequelize');

module.exports = function(conexion) {
  // Modelo de Usuarios
  const Usuario = conexion.define('Usuario', {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    username: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
    },
    sexo: {
      type: Sequelize.ENUM('Masculino', 'Femenino', 'Otro'),
      allowNull: false,
    },
    edad: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    contraseña: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    fotoPerfil: {
      type: Sequelize.STRING,
      allowNull: true,
    },
    tipoUsuario: {
      type: Sequelize.ENUM('Normal', 'Administrador'),
      allowNull: false,
    },
    claveEspecial: {
      type: Sequelize.STRING,
      allowNull: true,
    },
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

  // Establecer relaciones entre los modelos
  Usuario.hasMany(Producto, { foreignKey: 'idVendedor' });
  Producto.belongsTo(Usuario, { foreignKey: 'idVendedor' });

  return {
    Usuario,
    Producto,
  };
};
