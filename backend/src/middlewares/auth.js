const jwt = require('jsonwebtoken');

const verificarAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado. Token no proporcionado.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreto_tiendacontrol');
    req.usuario = decoded; // { id, email, rol, tiendaId }
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Token inválido o expirado.' });
  }
};

const esSuperAdmin = (req, res, next) => {
  if (req.usuario?.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren privilegios de SuperAdmin.' });
  }
  next();
};

module.exports = { verificarAuth, esSuperAdmin };