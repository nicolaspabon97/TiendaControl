const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // <-- Esto es vital para que acepte peticiones desde http://localhost:3000
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
// const productosRoutes = require('./routes/productos.routes'); // La crearemos en el siguiente paso

app.use(cors());
app.use(express.json());

// Registrar rutas
app.use('/api/auth', authRoutes);
// app.use('/api/productos', productosRoutes);

app.get('/', (req, res) => {
  res.send('API de TiendaControl Multi-Tenant funcionando correctamente 🇨🇴');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});