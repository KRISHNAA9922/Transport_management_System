const express = require('express');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all trips (Admin only)
router.get('/', authMiddleware(['admin']), async (req, res) => {
  try {
    const trips = await Trip.find()
      .populate('vehicle', 'name numberPlate')
      .populate('driver', 'name email')
      .lean();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get filtered trips for reports (Admin only)
router.get('/reports/trips', authMiddleware(['admin']), async (req, res) => {
  const { startDate, endDate, vehicle, driver } = req.query;

  try {
    const query = {};

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (vehicle) {
      query.vehicle = vehicle;
    }

    if (driver) {
      query.driver = driver;
    }

    const trips = await Trip.find(query)
      .populate('vehicle', 'name numberPlate')
      .populate('driver', 'name email')
      .lean();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching report trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add trip (Admin only)
router.post('/', authMiddleware(['admin']), async (req, res) => {
  let { source, destination, vehicle, driver, date, incomeExpected } = req.body;

  try {
    if (driver === 'self') {
      driver = req.user.id;
    }

    const trip = new Trip({
      source,
      destination,
      vehicle,
      driver,
      date,
      incomeExpected,
      status: 'Pending',
      createdBy: req.user.id,
    });
    await trip.save();
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'name numberPlate')
      .populate('driver', 'name email')
      .lean();
    res.status(201).json(populatedTrip);
  } catch (error) {
    console.error('Error adding trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update trip (Admin only)
router.put('/:id', authMiddleware(['admin']), async (req, res) => {
  let { source, destination, vehicle, driver, date, incomeExpected } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    if (driver === 'self') {
      driver = req.user.id;
    }

    trip.source = source;
    trip.destination = destination;
    trip.vehicle = vehicle;
    trip.driver = driver;
    trip.date = date;
    trip.incomeExpected = incomeExpected;
    trip.createdBy = req.user.id;

    await trip.save();
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'name numberPlate')
      .populate('driver', 'name email')
      .lean();
    res.json(populatedTrip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete trip (Admin only)
router.delete('/:id', authMiddleware(['admin']), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    await trip.deleteOne();
    res.json({ message: 'Trip deleted' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get driver's trips (Driver only)
router.get('/driver', authMiddleware(['driver']), async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.user.id })
      .populate('vehicle', 'name numberPlate')
      .sort({ date: -1 })
      .lean();
    res.json(trips);
  } catch (error) {
    console.error('Error fetching driver trips:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept trip (Driver only)
router.put('/accept/:id', authMiddleware(['driver']), async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (trip.status !== 'Pending') {
      return res.status(400).json({ message: 'Trip cannot be accepted' });
    }

    trip.status = 'Accepted';
    await trip.save();
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'name numberPlate')
      .lean();
    res.json(populatedTrip);
  } catch (error) {
    console.error('Error accepting trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Complete trip (Driver only)
router.put('/complete/:id', authMiddleware(['driver']), async (req, res) => {
  const { incomeReceived } = req.body;

  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    if (trip.driver.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (trip.status !== 'Accepted') {
      return res.status(400).json({ message: 'Trip cannot be completed' });
    }

    trip.status = 'Completed';
    trip.incomeReceived = incomeReceived;
    await trip.save();
    const populatedTrip = await Trip.findById(trip._id)
      .populate('vehicle', 'name numberPlate')
      .lean();
    res.json(populatedTrip);
  } catch (error) {
    console.error('Error completing trip:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;