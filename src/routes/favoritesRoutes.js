const express = require('express');
const router = express.Router();
const Favorite = require('../models/favorites');
const authenticateToken = require('../middleware/auth');

// GET: lista de favoritos del usuario logueado
router.get('/', authenticateToken, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id }).populate('vehicleId');
    res.json(favorites.map(f => f.vehicleId)); // devolvemos solo los vehículos
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener favoritos' });
  }
});

// POST: agregar un vehículo a favoritos
router.post('/:vehicleId', authenticateToken, async (req, res) => {
   try { const exists = await Favorite.findOne({
      userId: req.user.id, vehicleId: req.params.vehicleId 
      }); 
      if (exists) { 
      return res.status(400).json({ error: 'Ya está en favoritos' }); 
      } const fav = new Favorite({ userId: req.user.id, vehicleId: req.params.vehicleId });
      await fav.save();
      res.json({ message: 'Agregado a favoritos' });
    } catch (err) {
       res.status(500).json({ error: 'Error al agregar favorito' }); 
      } 
});

// DELETE: quitar un vehículo de favoritos
router.delete('/:vehicleId', authenticateToken, async (req, res) => {
  try {
    await Favorite.findOneAndDelete({
      userId: req.user.id,
      vehicleId: req.params.vehicleId
    });
    res.json({ message: 'Eliminado de favoritos' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar favorito' });
  }
});

module.exports = router;
