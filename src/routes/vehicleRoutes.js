const express = require('express');
const router = express.Router();
const Vehicle = require('../models/vehicle');
const authMiddleware = require('../middleware/auth');
const multer = require('multer'); 
const path = require('path');

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
    const imageFiles = req.files.map(file => file.filename);

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      {
        brand: req.body.brand,
        version: req.body.version,
        year: req.body.year,
        mileage: req.body.mileage,
        comment: req.body.comment,
        price: req.body.price,
        images: imageFiles
      },
      { new: true }
    );

    res.json(updatedVehicle);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar vehículo' });
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
