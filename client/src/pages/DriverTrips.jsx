import { useState, useEffect } from 'react';
import axios from 'axios';

function DriverTrips() {
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
      setError(err.response?.data?.message || 'Failed to fetch trips');
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
      setError(err.response?.data?.message || 'Failed to accept trip');
      console.error('Accept error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    const income = incomeReceived[id];
    if (!income || isNaN(income) || income <= 0) {
      setError('Please enter a valid income amount');
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
      setError(err.response?.data?.message || 'Failed to complete trip');
      console.error('Complete error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Active Trips</h1>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {loading && <p className="text-blue-500 mb-4">Loading...</p>}
      {trips.length === 0 ? (
        <p className="text-gray-600">No active trips found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-lg shadow">
            <thead>
              <tr className="bg-gray-200 text-gray-700">
                <th className="py-3 px-4 text-left">Source</th>
                <th className="py-3 px-4 text-left">Destination</th>
                <th className="py-3 px-4 text-left">Vehicle</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Expected Income</th>
                <th className="py-3 px-4 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip) => (
                <tr key={trip._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{trip.source}</td>
                  <td className="py-3 px-4">{trip.destination}</td>
                  <td className="py-3 px-4">
                    {trip.vehicle ? `${trip.vehicle.name} (${trip.vehicle.numberPlate})` : 'None'}
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
                        Accept
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
                          placeholder="Income Received"
                          className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleComplete(trip._id)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                          disabled={loading}
                        >
                          Complete
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