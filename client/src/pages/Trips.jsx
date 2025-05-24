import { useState, useEffect } from 'react';
import axios from 'axios';

function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [formData, setFormData] = useState({
    source: '',
    destination: '',
    vehicle: '',
    driver: '',
    date: '',
    incomeExpected: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get('http://localhost:5000/api/trips', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/vehicles', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('http://localhost:5000/api/auth/drivers', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Unauthorized: Please login again.');
        } else if (err.response.status === 403) {
          setError('Access denied: You do not have permission to view drivers.');
        } else {
          setError('Failed to fetch data');
        }
      } else {
        setError('Failed to fetch data');
      }
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        const response = await axios.put(
          `http://localhost:5000/api/trips/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTrips(trips.map((trip) => (trip._id === editingId ? response.data : trip)));
        setEditingId(null);
        setSuccessMessage('Trip updated successfully.');
      } else {
        const response = await axios.post('http://localhost:5000/api/trips', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips([...trips, response.data]);
        setSuccessMessage('Trip added successfully.');
      }
      setFormData({ source: '', destination: '', vehicle: '', driver: '', date: '', incomeExpected: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
      console.error('Submit error:', err);
    }
  };

  const handleEdit = (trip) => {
    setError('');
    setSuccessMessage('');
    setFormData({
      source: trip.source,
      destination: trip.destination,
      vehicle: trip.vehicle._id,
      driver: trip.driver._id,
      date: trip.date.split('T')[0],
      incomeExpected: trip.incomeExpected,
    });
    setEditingId(trip._id);
  };

  const handleDelete = async (id) => {
    setError('');
    setSuccessMessage('');
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/trips/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTrips(trips.filter((trip) => trip._id !== id));
        setSuccessMessage('Trip deleted successfully.');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete trip');
        console.error('Delete error:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Trips</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

      <div className="flex flex-col md:flex-row gap-6">
        {/* Left: Form */}
        <div className="md:w-1/3 bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Trip' : 'Add Trip'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="source">Source</label>
              <input
                type="text"
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="destination">Destination</label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="vehicle">Vehicle</label>
              <select
                id="vehicle"
                name="vehicle"
                value={formData.vehicle}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Vehicle</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.name} ({vehicle.numberPlate})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="driver">Driver</label>
              <select
                id="driver"
                name="driver"
                value={formData.driver}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Driver</option>
                {drivers.map((driver) => (
                  <option key={driver._id} value={driver._id}>
                    {driver.name} ({driver.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="incomeExpected">Expected Income</label>
              <input
                type="number"
                id="incomeExpected"
                name="incomeExpected"
                value={formData.incomeExpected}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              {editingId ? 'Update Trip' : 'Add Trip'}
            </button>
          </form>
        </div>

        {/* Right: Trip Cards */}
        <div className="md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Trip List</h2>
          {trips.length === 0 ? (
            <p className="text-gray-600">No trips found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trips.map((trip) => (
                <div key={trip._id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-semibold">
                    {trip.source} → {trip.destination}
                  </h3>
                  <p>Vehicle: {trip.vehicle.name} ({trip.vehicle.numberPlate})</p>
                  <p>Driver: {trip.driver.name}</p>
                  <p>Date: {new Date(trip.date).toLocaleDateString()}</p>
                  <p>Expected Income: ₹{trip.incomeExpected}</p>
                  <p>Status: {trip.status}</p>
                  <div className="mt-4 space-x-2">
                    <button
                      onClick={() => handleEdit(trip)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(trip._id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
  );
}

export default Trips;
