export const login = async (req, res) => {
  const { email, password } = req.body || {};

  if (email && email.trim() === 'admin@tiendacontrol.co' && password && password.trim() === '123456') {
    return res.status(200).json({
      success: true,
      message: 'Autenticación exitosa',
      token: 'jwt_token_temporal_tiendacontrol',
      user: {
        email: 'admin@tiendacontrol.co',
        nombre: 'Administrador',
        rol: 'ADMIN' // <-- Agregamos el rol para que el frontend lo lea bien
      }
    });
  }

  return res.status(400).json({ error: "Credenciales inválidas." });
};