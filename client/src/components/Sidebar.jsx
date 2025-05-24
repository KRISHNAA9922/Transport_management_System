import { useState, useEffect } from 'react';
import axios from 'axios';

function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    numberPlate: '',
    purchaseDate: '',
    image: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data);
    } catch (err) {
      setError('Failed to fetch vehicles');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (editingId) {
        // Update vehicle
        const response = await axios.put(
          `http://localhost:5000/api/vehicles/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVehicles(vehicles.map((vehicle) => (vehicle._id === editingId ? response.data : vehicle)));
        setEditingId(null);
      } else {
        // Add vehicle
        const response = await axios.post('http://localhost:5000/api/vehicles', formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles([...vehicles, response.data]);
      }
      setFormData({ name: '', type: '', numberPlate: '', purchaseDate: '', image: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Server error');
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      numberPlate: vehicle.numberPlate,
      purchaseDate: vehicle.purchaseDate.split('T')[0], // Format for input
      image: vehicle.image,
    });
    setEditingId(vehicle._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles(vehicles.filter((vehicle) => vehicle._id !== id));
      } catch (err) {
        setError('Failed to delete vehicle');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">Vehicles</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow max-w-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="type">
              Type
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="numberPlate">
              Number Plate
            </label>
            <input
              type="text"
              id="numberPlate"
              name="numberPlate"
              value={formData.numberPlate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="purchaseDate">
              Purchase Date
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="image">
              Image URL (Optional)
            </label>
            <input
              type="text"
              id="image"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            {editingId ? 'Update Vehicle' : 'Add Vehicle'}
          </button>
        </form>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Vehicle List</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold">{vehicle.name}</h3>
              <p>Type: {vehicle.type}</p>
              <p>Number Plate: {vehicle.numberPlate}</p>
              <p>Purchase Date: {new Date(vehicle.purchaseDate).toLocaleDateString()}</p>
              {vehicle.image && (
                <img src={vehicle.image} alt={vehicle.name} className="w-32 h-32 object-cover mt-2" />
              )}
              <div className="mt-4 space-x-2">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(vehicle._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Vehicles;