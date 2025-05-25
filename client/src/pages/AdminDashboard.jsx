import { useState, useEffect } from 'react';
import api from '../api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useTranslation } from 'react-i18next';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function AdminDashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalTrips: 0,
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [tripsRes, expensesRes] = await Promise.all([
          api.get('/api/trips', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get('/api/expenses', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const trips = tripsRes.data;
        const expenses = expensesRes.data;

        const totalTrips = trips.length;
        const totalIncome = trips.reduce((sum, trip) => sum + trip.incomeReceived, 0);
        const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const profit = totalIncome - totalExpenses;

        setStats({ totalTrips, totalIncome, totalExpenses, profit });

        const monthlyIncome = Array(12).fill(0);
        const monthlyExpenses = Array(12).fill(0);

        trips.forEach((trip) => {
          const month = new Date(trip.date).getMonth();
          monthlyIncome[month] += trip.incomeReceived;
        });

        expenses.forEach((expense) => {
          const month = new Date(expense.date).getMonth();
          monthlyExpenses[month] += expense.amount;
        });

        setChartData({
          labels: [
            t('Jan'), t('Feb'), t('Mar'), t('Apr'), t('May'), t('Jun'),
            t('Jul'), t('Aug'), t('Sep'), t('Oct'), t('Nov'), t('Dec'),
          ],
          datasets: [
            {
              label: t('Income'),
              data: monthlyIncome,
              backgroundColor: '#2563eb',
              borderRadius: 6,
              barThickness: 20,
            },
            {
              label: t('Expenses'),
              data: monthlyExpenses,
              backgroundColor: '#f43f5e',
              borderRadius: 6,
              barThickness: 20,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [t]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('admin_dashboard')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t('total_trips'), value: stats.totalTrips },
          { label: t('total_income'), value: `₹${stats.totalIncome}` },
          { label: t('total_expenses'), value: `₹${stats.totalExpenses}` },
          { label: t('profit'), value: `₹${stats.profit}` },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
            <h2 className="text-lg font-semibold text-gray-600">{item.label}</h2>
            <p className="text-2xl font-bold text-gray-800 mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">{t('monthly_income_vs_expense')}</h2>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
                labels: {
                  color: '#374151',
                  font: { size: 14, weight: 'bold' },
                },
              },
              title: {
                display: true,
                text: t('Monthly Income vs Expenses'),
                font: { size: 18 },
                color: '#1f2937',
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  color: '#6b7280',
                  callback: (value) => `₹${value}`,
                },
                title: {
                  display: true,
                  text: t('Amount (INR)'),
                  color: '#6b7280',
                  font: { size: 14 },
                },
              },
              x: {
                ticks: { color: '#6b7280' },
              },
            },
          }}
        />
      </div>
    </div>
  );
}

export default AdminDashboard;
