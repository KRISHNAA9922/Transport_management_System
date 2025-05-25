const express = require('express');
const Expense = require('../models/Expense');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all expenses (Authenticated users)
router.get('/', authMiddleware(), async (req, res) => {
  try {
    const expenses = await Expense.find().populate('vehicle', 'name numberPlate');
    res.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add expense (Authenticated users)
router.post('/', authMiddleware(), async (req, res) => {
  const { type, amount, date, vehicle, notes } = req.body;

  try {
    const expense = new Expense({
      type,
      amount,
      date,
      vehicle: vehicle || null,
      notes,
    });
    await expense.save();
    const populatedExpense = await Expense.findById(expense._id).populate('vehicle', 'name numberPlate');
    res.status(201).json(populatedExpense);
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense (Authenticated users)
router.put('/:id', authMiddleware(), async (req, res) => {
  const { type, amount, date, vehicle, notes } = req.body;

  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.type = type;
    expense.amount = amount;
    expense.date = date;
    expense.vehicle = vehicle || null;
    expense.notes = notes;

    await expense.save();
    const populatedExpense = await Expense.findById(expense._id).populate('vehicle', 'name numberPlate');
    res.json(populatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense (Authenticated users)
router.delete('/:id', authMiddleware(), async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
