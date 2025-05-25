import { useState, useEffect } from 'react';
import api from '../api';
import { useTranslation } from 'react-i18next';

function Vehicles() {
  const { t } = useTranslation();
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
      const response = await api.get('/api/vehicles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVehicles(response.data);
    } catch (err) {
      setError(t('fetch_vehicles_error'));
      console.error('Fetch error:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (editingId) {
        const { data } = await api.put(
          `/api/vehicles/${editingId}`,
          formData,
          config
        );
        setVehicles((prev) =>
          prev.map((v) => (v._id === editingId ? data : v))
        );
        setEditingId(null);
      } else {
        const { data } = await api.post('/api/vehicles', formData, config);
        setVehicles([...vehicles, data]);
      }

      setFormData({
        name: '',
        type: '',
        numberPlate: '',
        purchaseDate: '',
        image: '',
      });
      setError('');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err.response?.data?.message || t('server_error'));
    }
  };

  const handleEdit = (vehicle) => {
    setFormData({
      name: vehicle.name,
      type: vehicle.type,
      numberPlate: vehicle.numberPlate,
      purchaseDate: vehicle.purchaseDate?.split('T')[0] || '',
      image: vehicle.image || '',
    });
    setEditingId(vehicle._id);
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('confirm_delete_vehicle'))) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/api/vehicles/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setVehicles((prev) => prev.filter((v) => v._id !== id));
      } catch (err) {
        console.error('Delete error:', err);
        setError(t('delete_vehicle_error'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{t('vehicle_management')}</h1>
      {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

      <div className="flex flex-col md:flex-row gap-4">
        {/* Left Side: Form */}
        <div className="w-full md:w-1/3 bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-3">
            {editingId ? t('edit_vehicle') : t('add_vehicle')}
          </h2>
          <form onSubmit={handleSubmit}>
            {['name', 'type', 'numberPlate', 'purchaseDate'].map((field) => (
              <div className="mb-3" key={field}>
                <label className="block text-sm text-gray-700 mb-1" htmlFor={field}>
                  {t(field)}
                </label>
                <input
                  type={field === 'purchaseDate' ? 'date' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            ))}
            <div className="mb-4">
              <label className="block text-sm text-gray-700 mb-1" htmlFor="image">
                {t('image_url_optional')}
              </label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                className="w-full px-2 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              {editingId ? t('update_vehicle') : t('add_vehicle')}
            </button>
          </form>
        </div>

        {/* Right Side: Vehicle Cards */}
        <div className="w-full md:w-2/3">
          <h2 className="text-lg font-semibold mb-3">{t('vehicle_list')}</h2>
          {vehicles.length === 0 ? (
            <p className="text-gray-600">{t('no_vehicles_found')}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {vehicles.map((vehicle) => (
                <div
                  key={vehicle._id}
                  className="bg-white p-3 rounded-lg shadow"
                >
                  <h3 className="text-md font-semibold">{vehicle.name}</h3>
                  <p className="text-sm">{t('type')}: {vehicle.type}</p>
                  <p className="text-sm">{t('number_plate')}: {vehicle.numberPlate}</p>
                  <p className="text-sm">
                    {t('purchase_date')}: {' '}
                    {new Date(vehicle.purchaseDate).toLocaleDateString()}
                  </p>
                  {vehicle.image && (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-28 object-cover mt-2 rounded"
                    />
                  )}
                  <div className="mt-3 space-x-2">
                    <button
                      onClick={() => handleEdit(vehicle)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={() => handleDelete(vehicle._id)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                    >
                      {t('delete')}
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

export default Vehicles;
