const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  source: {
    type: String,
    required: [true, 'Source is required'],
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required'],
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Driver is required'],
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  incomeExpected: {
    type: Number,
    required: [true, 'Expected income is required'],
  },
  incomeReceived: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'Completed'],
    default: 'Pending',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('Trip', tripSchema);