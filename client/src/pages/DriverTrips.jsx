import { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

function DriverTrips() {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [incomeReceived, setIncomeReceived] = useState({});

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/trips/driver', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTrips(response.data.filter((trip) => trip.status !== 'Completed'));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('fetch_trips_error'));
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/trips/accept/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips(trips.map((trip) => (trip._id === id ? response.data : trip)));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('accept_trip_error'));
      console.error('Accept error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    const income = incomeReceived[id];
    if (!income || isNaN(income) || income <= 0) {
      setError(t('valid_income_error'));
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/trips/complete/${id}`,
        { incomeReceived: parseFloat(income) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTrips(trips.filter((trip) => trip._id !== id));
      setIncomeReceived((prev) => ({ ...prev, [id]: '' }));
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || t('complete_trip_error'));
      console.error('Complete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">{t('active_trips')}</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">{t('loading')}</p>}
      {trips.length === 0 ? (
        <p className="text-gray-600">{t('no_active_trips')}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">{t('source')}</th>
                <th className="py-3 px-4 text-left">{t('destination')}</th>
                <th className="py-3 px-4 text-left">{t('vehicle')}</th>
                <th className="py-3 px-4 text-left">{t('date')}</th>
                <th className="py-3 px-4 text-left">{t('status')}</th>
                <th className="py-3 px-4 text-left">{t('expected_income')}</th>
                <th className="py-3 px-4 text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{trip.source}</td>
                  <td className="py-3 px-4">{trip.destination}</td>
                  <td className="py-3 px-4">
                    {trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.numberPlate})` : t('none')}
                  </td>
                  <td className="py-3 px-4">{new Date(trip.date).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{trip.status}</td>
                  <td className="py-3 px-4">₹{trip.incomeExpected}</td>
                  <td className="py-3 px-4">
                    {trip.status === 'Pending' && (
                      <button
                        onClick={() => handleAccept(trip._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 disabled:opacity-50"
                        disabled={loading}
                      >
                        {t('accept')}
                      </button>
                    )}
                    {trip.status === 'Accepted' && (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={incomeReceived[trip._id] || ''}
                          onChange={(e) =>
                            setIncomeReceived({ ...incomeReceived, [trip._id]: e.target.value })
                          }
                          placeholder={t('income_received')}
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleComplete(trip._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                          disabled={loading}
                        >
                          {t('complete')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DriverTrips;
