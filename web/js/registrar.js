require('dotenv').config();
const claveEspecialEnviada = req.body.claveEspecial || '';
const claveEspecialReal = process.env.CLAVE_ESPECIAL || '';

claveEspecialValida = await bcrypt.compare(claveEspecialEnviada, claveEspecialReal);

if (!claveEspecialValida) {
  return res.render('registrarse', { error: 'Clave especial incorrecta' });
}
