const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Fuel', 'Toll', 'Repairs', 'Driver Salary', 'Miscellaneous'],
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    default: null,
  },
  notes: {
    type: String,
    default: '',
  },
});

module.exports = mongoose.model('Expense', expenseSchema);