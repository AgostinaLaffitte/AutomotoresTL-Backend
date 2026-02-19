const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const vehicleRoutes = require('./src/routes/vehicleRoutes'); 
const authRoutes = require('./src/routes/authRoutes'); 
const favoritesRoutes = require('./src/routes/favoritesRoutes'); 
const contactRoutes = require('./src/routes/contactRoutes');
const app = express();
app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Conectado a MongoDB Atlas'))
.catch(err => console.error('Error de conexión:', err));

  
app.use('/api/contact', contactRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/auth', authRoutes); 
app.use('/api/favorites', favoritesRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Backend corriendo en http://localhost:${PORT}`));
