const express = require('express');
const Vehicle = require('../models/Vehicle');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all vehicles (Admin only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const vehicles = await Vehicle.find().populate('createdBy', 'name email');
    res.json(vehicles);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add vehicle (Admin only)
router.post('/', authMiddleware(['admin']), async (req, res) => {
  const { name, type, numberPlate, purchaseDate, image } = req.body;
  try {
    const vehicle = new Vehicle({
      name,
      type,
      numberPlate,
      purchaseDate,
      image,
      createdBy: req.user.id,
    });
    await vehicle.save();
    res.status(201).json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update vehicle (Admin only)
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  const { name, type, numberPlate, purchaseDate, image } = req.body;
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      { name, type, numberPlate, purchaseDate, image },
      { new: true }
    );
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete vehicle (Admin only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;