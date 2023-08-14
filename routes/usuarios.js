var ruta = require('express').Router();
var bcrypt = require('bcrypt'); // Importa la biblioteca bcrypt
var multer = require('multer'); // Importa la biblioteca multer
var { where } = require('sequelize');
var conexion = require('../conexion'); // Importa la conexión, que contiene el modelo Usuario
require('dotenv').config();
var Usuario = conexion.Usuario;
var Producto = conexion.Producto;
var path = require('path'); // Importar el módulo path
var fs = require('fs');

const storagePerfil = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'web/uploads/perfil');
  },
  filename: function (req, file, cb) {
    cb(null, 'perfil-' + Date.now() + path.extname(file.originalname));
  },
});

const storageProductos = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'web/uploads/productos');
  },
  filename: function (req, file, cb) {
    cb(null, 'producto-' + Date.now() + path.extname(file.originalname));
  },
});

const uploadPerfil = multer({ storage: storagePerfil });
const uploadProductos = multer({ storage: storageProductos });





// Ruta para la página de registro (GET)
ruta.get('/registrarse', function(req, res) {
  res.render('registrarse', { error: null });
});

// Ruta para el procesamiento del formulario de registro (POST)
// ... (código previo)

ruta.post('/registrarse', uploadPerfil.single('fotoPerfil'), async function(req, res) {
  try {
    // Obtén los datos del formulario enviados por el cliente
    const { nombre, username, sexo, edad, password, tipoUsuario, claveEspecial } = req.body;
    // Encripta la contraseña antes de guardarla en la base de datos
    const hashedPassword = await bcrypt.hash(password, 10);

    // Verifica si se requiere una clave especial para el tipo de usuario
    const requiereClaveEspecial = tipoUsuario === 'Administrador';

    if (requiereClaveEspecial) {
      // Verifica si la clave especial enviada coincide con "123"
      const claveEspecialValida = claveEspecial === '123';
      if (!claveEspecialValida) {
        console.log('Clave Especial Incorrecta');
        return res.render('registrarse', { error: 'Clave especial incorrecta' });
      }
    }

    // Crea un nuevo usuario con los datos proporcionados y guarda en la base de datos
    await Usuario.create({
      nombre: nombre,
      username: username,
      sexo: sexo,
      edad: edad,
      contraseña: hashedPassword,
      fotoPerfil: req.file ? req.file.filename : null,
      tipoUsuario: tipoUsuario,
    });

    // Redirige al inicio de sesión después de registrar al usuario
    res.redirect("/iniciar_sesion");
  } catch (error) {
    console.error('Error al registrar el usuario:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// ... (resto del código)

module.exports = ruta;



ruta.post('/iniciar_sesion', async function(req, res) {
  const { username, password } = req.body;

  console.log('Intento de inicio de sesión:', username);

  try {
    // Busca al usuario por su nombre de usuario en la base de datos
    const usuario = await Usuario.findOne({ where: { username: username } });

    console.log('Usuario encontrado en la base de datos:', usuario);

    if (!usuario) {
      // Si el usuario no existe, muestra un mensaje de error
      console.log('Usuario no encontrado en la base de datos');
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    // Compara la contraseña ingresada con la contraseña almacenada (encriptada) en la base de datos
    const isPasswordValid = await bcrypt.compare(password, usuario.contraseña);

    console.log('Contraseña válida:', isPasswordValid);

    if (!isPasswordValid) {
      // Si la contraseña no coincide, muestra un mensaje de error
      console.log('Contraseña incorrecta');
      return res.render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    // Si la contraseña es válida, crea una sesión para el usuario y establece la variable de sesión 'usuario'
    req.session.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      username: usuario.username,
      tipoUsuario: usuario.tipoUsuario,
      edad : usuario.edad,
      sexo : usuario.sexo,
      fotoPerfil: usuario.fotoPerfil
    };

    // Renderiza la página de perfil de usuario directamente en lugar de redirigir
    console.log('Inicio de sesión exitoso');
    return res.render('profile', { usuario: req.session.usuario });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).send('Error interno del servidor');
  }
});


ruta.get('/iniciar_sesion', verificarSesion, function(req, res) {
  // Verificar si el usuario ha iniciado sesión y redirigir a la página de perfil si es así
  if (req.session.usuario) {
    res.redirect('/profile');
  } else {
    // Renderizar la vista de inicio de sesión y definir la variable 'error' como null
    res.render('login', { error: null });
  }
});





ruta.get('/', verificarSesion, async function(req, res) {
  try {
    var productos = await Producto.findAll({
      limit: 5,  // Limita la consulta a los últimos 5 productos
      order: [['createdAt', 'DESC']],  // Ordena por fecha de creación descendente
    });

    if (productos.length === 0) {
      // Si no hay productos, renderiza la vista 'sin_productos'
      return res.render('sin_productos');
    }

    res.render('inicio', { productos }); // Renderiza la vista 'inicio' y pasa los productos como datos
  } catch (error) {
    console.error('Error al obtener los productos:', error);
    res.status(500).send('Error interno del servidor');
  }
});

function verificarSesion(req, res, next) {
  if (req.session && req.session.usuario) {
    // El usuario ha iniciado sesión, obtener sus datos y pasarlos a la vista
    var usuario = req.session.usuario;
    res.locals.usuario = usuario;
  }
  next();
}



// Ruta para la página de categorías
ruta.get('/categorias', verificarSesion, function(req, res) {
  // Código para obtener y renderizar la página de categorías
  res.render('categorias');
});

// Ruta para la página "Acerca de Nosotros"
ruta.get('/acerca', verificarSesion, function(req, res) {
  // Código para obtener y renderizar la página "Acerca de Nosotros"
  res.render('acerca');
});

// Ruta para la página "Acerca de los Artesanos"
ruta.get('/artesanos', verificarSesion, function(req, res) {
  // Código para obtener y renderizar la página "Acerca de los Artesanos"
  res.render('artesanos');
});

ruta.get('/profile', verificarSesion, function(req, res) {
  if (req.session.usuario) {
    // Verifica si la imagen de perfil existe en la ruta
    if (req.session.usuario.fotoPerfil) {
      const fotoPerfilPath = path.join(__dirname, '..', 'web', 'uploads', req.session.usuario.fotoPerfil);
      const fotoPerfilExistente = fs.existsSync(fotoPerfilPath);

      res.render('profile', {
        usuario: req.session.usuario,
        fotoPerfilExistente,
        fotoPerfil: req.session.usuario.fotoPerfil,
      });
    } else {
      // Si la foto de perfil no está definida, pasa null como valor para la ruta
      res.render('profile', {
        usuario: req.session.usuario,
        fotoPerfilExistente: false,
        fotoPerfil: null,
      });
    }
  } else {
    res.redirect('/iniciar_sesion');
  }
});





ruta.post('/cerrar_sesion', (req, res) => {
  // Elimina las cookies de sesión y redirige al inicio de sesión
  req.session = null;
  res.redirect('/iniciar_sesion');
});


// Eliminar producto (solo para administradores)
ruta.post('/eliminar_producto', verificarSesion, async function(req, res) {
  try {
    // Verificar si el usuario es administrador
    if (req.session.usuario && req.session.usuario.tipoUsuario === 'Administrador') {
      const productoId = parseInt(req.body.productoId); // Convertir el ID del producto a número entero

      // Buscar y eliminar el producto por su ID
      await Producto.destroy({ where: { id: productoId } });

      res.redirect('/'); // Redirigir a la página de inicio después de eliminar el producto
    } else {
      res.status(403).send('Acceso no autorizado'); // Si no es administrador, enviar respuesta de acceso no autorizado
    }
  } catch (error) {
    console.error('Error al eliminar el producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});



ruta.get('/logout', function(req, res) {
  // Destruye la sesión y redirecciona al inicio de sesión
  req.session = null;
  res.redirect('/iniciar_sesion');
});


// ...

ruta.post('/cambiar_foto', uploadPerfil.single('nuevaFotoPerfil'), function(req, res) {
  if (req.session.usuario) {
    const usuarioId = req.session.usuario.id;

    if (req.file) {
      // Obtén el nombre del archivo cargado
      const nombreArchivo = req.file.filename;

      // Construye la ruta completa al archivo utilizando __dirname y rutas relativas
      const rutaArchivo = path.resolve(__dirname, '..', 'web', 'uploads', nombreArchivo);

      // Actualiza la propiedad 'fotoPerfil' en la base de datos con la nueva ruta
      Usuario.update({ fotoPerfil: rutaArchivo }, { where: { id: usuarioId } })
        .then(() => {
          // Redirige al perfil del usuario después de cambiar la foto
          res.redirect('/profile');
        })
        .catch((error) => {
          console.error('Error al cambiar la foto de perfil:', error);
          res.status(500).send('Error interno del servidor');
        });
    } else {
      // Si no se proporcionó un archivo, redirige de vuelta al perfil sin cambios
      res.redirect('/profile');
    }
  } else {
    res.redirect('/iniciar_sesion');
  }
});
ruta.get('/subir_productos', verificarSesion, function(req, res) {
  // Verificar si el usuario ha iniciado sesión
  if (req.session.usuario) {
    // Renderizar la página de subir productos
    res.render('subir_productos');
  } else {
    // Redirigir al inicio de sesión si no ha iniciado sesión
    res.redirect('/iniciar_sesion');
  }
});
ruta.post('/guardar_producto', uploadProductos.single('imagen'), async function (req, res) {
  try {
    // Obtén la información del usuario logeado desde la sesión
    const usuarioLogeado = req.session.usuario;

    const { nombre, descripcion, precio } = req.body;

    // Guardar el producto en la base de datos con la ID del usuario logeado como vendedor
    const nuevoProducto = await Producto.create({
      idVendedor: usuarioLogeado.id,  // Utiliza la ID del usuario logeado como vendedor
      nombre: nombre,
      descripcion: descripcion,
      fotoProducto: req.file ? req.file.filename : null,
      precio: precio,
    });

    // Agregar el producto recién creado al carrito de compras
    if (!req.session.carrito) {
      req.session.carrito = [];
    }
    req.session.carrito.push(nuevoProducto.id);

    // Redirigir a la página de perfil del usuario después de subir el producto
    res.redirect('/profile');
  } catch (error) {
    console.error('Error al subir el producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

ruta.post('/guardar_producto', uploadProductos.single('imagen'), async function (req, res) {
  try {
    // Obtén la información del usuario logeado desde la sesión
    const usuarioLogeado = req.session.usuario;

    const { nombre, descripcion, precio } = req.body;

    // Guardar el producto en la base de datos con la ID del usuario logeado como vendedor
    const nuevoProducto = await Producto.create({
      idVendedor: usuarioLogeado.id,  // Utiliza la ID del usuario logeado como vendedor
      nombre: nombre,
      descripcion: descripcion,
      fotoProducto: req.file ? req.file.filename : null,
      precio: precio,
    });

    // Agregar el producto recién creado al carrito de compras
    if (!req.session.carrito) {
      req.session.carrito = [];
    }
    req.session.carrito.push(nuevoProducto.id);

    // Redirigir a la página de perfil del usuario después de subir el producto
    res.redirect('/profile');
  } catch (error) {
    console.error('Error al subir el producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Agregar producto al carrito
ruta.post('/agregar_al_carrito', function(req, res) {
  try {
    const productoId = parseInt(req.body.productoId); // Convertir el ID del producto a número entero

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Verificar si el producto ya está en el carrito
    const productoEnCarrito = req.session.carrito.find(item => item.id === productoId);

    if (productoEnCarrito) {
      // Si el producto ya está en el carrito, incrementa la cantidad
      productoEnCarrito.cantidad++;
    } else {
      // Si el producto no está en el carrito, agrégalo con cantidad inicial 1
      req.session.carrito.push({
        id: productoId,
        cantidad: 1,
      });
    }

    res.redirect('/carrito'); // Redirige a la página del carrito
  } catch (error) {
    console.error('Error al agregar el producto al carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Ver el contenido del carrito
ruta.get('/carrito', verificarSesion, async function(req, res) {
  try {
    const carritoProductos = [];

    if (req.session.carrito) {
      for (const item of req.session.carrito) {
        // Busca el producto en la base de datos por su id
        const producto = await Producto.findOne({ where: { id: item.id } });
        if (producto) {
          carritoProductos.push({
            producto,
            cantidad: item.cantidad,
          });
        }
      }
    }

    res.render('carrito', { carritoProductos });
  } catch (error) {
    console.error('Error al obtener productos del carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Eliminar producto del carrito
ruta.post('/eliminar_del_carrito', function(req, res) {
  try {
    const productoId = parseInt(req.body.productoId); // Convertir el ID del producto a número entero

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Encuentra el índice del producto en el carrito por su id
    const index = req.session.carrito.findIndex(item => item.id === productoId);

    if (index !== -1) {
      // Elimina el producto del carrito
      req.session.carrito.splice(index, 1);
    }

    res.redirect('/carrito'); // Redirige a la página del carrito
  } catch (error) {
    console.error('Error al eliminar el producto del carrito:', error);
    res.status(500).send('Error interno del servidor');
  }
});

// Actualizar cantidad de productos en el carrito
ruta.post('/actualizar_cantidad', function(req, res) {
  try {
    const productoId = parseInt(req.body.productoId); // Convertir el ID del producto a número entero
    const nuevaCantidad = parseInt(req.body.cantidad); // Convertir la cantidad a número entero

    if (!req.session.carrito) {
      req.session.carrito = [];
    }

    // Buscar el producto en el carrito
    const productoEnCarrito = req.session.carrito.find(item => item.id === productoId);

    if (productoEnCarrito) {
      // Actualizar la cantidad del producto
      productoEnCarrito.cantidad = nuevaCantidad;
    }

    res.redirect('/carrito'); // Redirige a la página del carrito
  } catch (error) {
    console.error('Error al actualizar la cantidad del producto:', error);
    res.status(500).send('Error interno del servidor');
  }
});
ruta.post('/comprar', async function(req, res) {
  try {
    if (!req.session.carrito || req.session.carrito.length === 0) {
      // Si no hay productos en el carrito, muestra un mensaje de error
      res.send("El carrito está vacío");
      return;
    }

    // ... (Código para obtener productos del carrito y calcular el total)

    // Realiza cualquier acción adicional relacionada con la compra aquí
    // Por ejemplo, registrar la compra en la base de datos

    // Limpia el carrito después de la compra
    req.session.carrito = [];

    // Espera un momento antes de redirigir a la página de inicio
    setTimeout(() => {
      // Redirige a la página de inicio después de un breve retraso
      res.redirect('/');
    }, 10000); // Redirige después de 3 segundos (puedes ajustar el tiempo según tus preferencias)
  } catch (error) {
    console.error('Error al procesar la compra:', error);
    res.status(500).send('Error interno del servidor');
  }
});

module.exports = ruta;
