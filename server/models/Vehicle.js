const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Vehicle name is required'],
  },
  type: {
    type: String,
    required: [true, 'Vehicle type is required'],
  },
  numberPlate: {
    type: String,
    required: [true, 'Number plate is required'],
    unique: true,
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Purchase date is required'],
  },
  image: {
    type: String,
    default: '',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);