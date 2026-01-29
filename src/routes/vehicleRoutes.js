const express = require('express');
const router = express.Router();
const Vehicle = require('../models/vehicle');
const authMiddleware = require('../middleware/auth');
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');

// -------------------- Configuración de Multer --------------------
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // nombre único
  }
});
const upload = multer({ storage: storage });

// -------------------- Rutas de imágenes --------------------
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ninguna imagen' });
  }
  res.json({ imageUrl: `/uploads/${req.file.filename}` });
});

// -------------------- CRUD de vehículos --------------------

// GET todos los vehículos
router.get('/', async (req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  console.log('req.files:', req.files); 
  console.log('req.body:', req.body);
  try {
    const imageFiles = req.files.map(file => file.filename);

    const newVehicle = new Vehicle({
      brand: req.body.brand,
      version: req.body.version,
      year: req.body.year,
      mileage: req.body.mileage,
      comment: req.body.comment,
      price: req.body.price,  
      images: imageFiles
    });

    await newVehicle.save();
    res.json(newVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear vehículo', details: err.message });
  }
});


router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    // Si hay nuevas imágenes, las agregamos; si no, mantenemos las existentes
    const imageFiles = req.files.length > 0 
      ? [...vehicle.images, ...req.files.map(file => file.filename)]
      : vehicle.images;

    vehicle.brand = req.body.brand;
    vehicle.version = req.body.version;
    vehicle.year = req.body.year;
    vehicle.mileage = req.body.mileage;
    vehicle.comment = req.body.comment;
    vehicle.price = req.body.price;
    vehicle.images = imageFiles;

    const updatedVehicle = await vehicle.save();
    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar vehículo', details: err.message });
  }
});


router.delete('/:id/images/:filename', authMiddleware, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) return res.status(404).json({ error: 'Vehículo no encontrado' });

    // Filtrar las imágenes y sacar la que coincide
    vehicle.images = vehicle.images.filter(img => img !== req.params.filename);
    await vehicle.save();

    // Borrar archivo físico
    const filePath = path.join(__dirname, '../../uploads', req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json(vehicle);
  } catch (err) {
    res.status(500).json({ error: 'Error al borrar imagen', details: err.message });
  }
});



// Eliminar vehículo
router.delete('/:id', authMiddleware, async (req, res) => {
  await Vehicle.findByIdAndDelete(req.params.id);
  res.json({ message: 'Vehículo eliminado' });
});

// GET /api/vehicles/search?q=ford 
router.get('/search', async (req, res) => {
   const query = req.query.q || ''; 
   console.log('Buscando:', query);
   try {
     const vehicles = await Vehicle.find({ 
      $or: [ { brand: { $regex: query, $options: 'i'}
     },
    { version: {
         $regex: query, $options: 'i' } }, 
    { comment: {
       $regex: query, $options: 'i' } } ] });
     res.json(vehicles); 
    } catch (err) { 
      res.status(500).json({ error: 'Error en búsqueda' }); 
    } 
  });
  // GET vehículo por ID
router.get('/:id', async (req, res) => {
  const vehicle = await Vehicle.findById(req.params.id);
  if (!vehicle) return res.status(404).json({ message: 'No encontrado' });
  res.json(vehicle);
});

// -------------------- Exportación --------------------
module.exports = router;
