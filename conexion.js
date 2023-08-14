const mongoose = require('mongoose');
require('dotenv').config();

const dbURI = process.env.DB_MONGODB_URI;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true, // Utilizar createIndexes en Mongoose 7.x
});

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('Error al conectar a MongoDB:', error);
});

db.once('open', () => {
  console.log('Conectado a MongoDB');
});

module.exports = db;
