import { useState, useEffect } from 'react';
import axios from 'axios';

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    type: 'Fuel',
    amount: '',
    date: '',
    vehicle: '',
    notes: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const [expensesRes, vehiclesRes] = await Promise.all([
        axios.get('http://localhost:5000/api/expenses', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get('http://localhost:5000/api/vehicles', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setExpenses(expensesRes.data);
      setVehicles(vehiclesRes.data);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setError('Unauthorized: Please login again.');
      else if (status === 403) setError('Access denied.');
      else setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    const payload = { ...formData, vehicle: formData.vehicle || null };

    try {
      const response = editingId
        ? await axios.put(`http://localhost:5000/api/expenses/${editingId}`, payload, {
            headers: { Authorization: `Bearer ${token}` },
          })
        : await axios.post('http://localhost:5000/api/expenses', payload, {
            headers: { Authorization: `Bearer ${token}` },
          });

      const updated = editingId
        ? expenses.map((ex) => (ex._id === editingId ? response.data : ex))
        : [...expenses, response.data];

      setExpenses(updated);
      setFormData({ type: 'Fuel', amount: '', date: '', vehicle: '', notes: '' });
      setEditingId(null);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (expense) => {
    setFormData({
      type: expense.type,
      amount: expense.amount,
      date: expense.date.split('T')[0],
      vehicle: expense.vehicle?._id || '',
      notes: expense.notes,
    });
    setEditingId(expense._id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(expenses.filter((ex) => ex._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredExpenses = filterType
    ? expenses.filter((ex) => ex.type === filterType)
    : expenses;

  return (
    <div className="p-4 sm:p-6 md:p-8 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Expenses</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {loading && <p className="text-blue-500 text-center mb-4">Loading...</p>}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Form on the Left */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Expense' : 'Add Expense'}</h2>
            <form onSubmit={handleSubmit} className="grid gap-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-xl"
                  required
                >
                  <option>Fuel</option>
                  <option>Toll</option>
                  <option>Repairs</option>
                  <option>Driver Salary</option>
                  <option>Miscellaneous</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium mb-1">Amount</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-xl"
                  required
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-xl"
                  required
                />
              </div>

              {/* Vehicle */}
              <div>
                <label className="block text-sm font-medium mb-1">Vehicle (Optional)</label>
                <select
                  name="vehicle"
                  value={formData.vehicle}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-xl"
                >
                  <option value="">None</option>
                  {vehicles.map((v) => (
                    <option key={v._id} value={v._id}>
                      {v.name} ({v.numberPlate})
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded-xl"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                disabled={loading}
              >
                {editingId ? 'Update Expense' : 'Add Expense'}
              </button>
            </form>
          </div>

          {/* Cards on the Right */}
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow">
            <h2 className="text-xl font-semibold mb-4">Expense List</h2>

            {/* Filter */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full border px-3 py-2 rounded-xl"
              >
                <option value="">All</option>
                <option>Fuel</option>
                <option>Toll</option>
                <option>Repairs</option>
                <option>Driver Salary</option>
                <option>Miscellaneous</option>
              </select>
            </div>

            {filteredExpenses.length === 0 ? (
              <p className="text-gray-500">No expenses found.</p>
            ) : (
              <div className="grid gap-4">
                {filteredExpenses.map((ex) => (
                  <div key={ex._id} className="p-4 bg-gray-50 border rounded-xl shadow-sm">
                    <h3 className="font-semibold text-lg">{ex.type}</h3>
                    <p>Amount: ₹{ex.amount}</p>
                    <p>Date: {new Date(ex.date).toLocaleDateString()}</p>
                    <p>Vehicle: {ex.vehicle ? `${ex.vehicle.name} (${ex.vehicle.numberPlate})` : 'None'}</p>
                    <p>Notes: {ex.notes || 'None'}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleEdit(ex)}
                        className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(ex._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Expenses;
