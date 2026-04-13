import { useEffect, useState } from 'react';
import { fineService, Fine } from '../services/fineService';
import { riderService, Rider } from '../services/riderService';
import { activityService } from '../services/activityService';
import { AlertCircle, CreditCard as Edit2, Trash2, Plus } from 'lucide-react';

interface FormData {
  rider_id: string;
  amount: number;
  description: string;
  category: string;
  reason: string;
}

const emptyForm: FormData = {
  rider_id: '',
  amount: 0,
  description: '',
  category: 'violation',
  reason: '',
};

const categories = ['damage', 'violation', 'absence', 'other'];

export function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [finesData, ridersData] = await Promise.all([
        fineService.getAllFines(),
        riderService.getAllRiders(),
      ]);
      setFines(finesData);
      setRiders(ridersData);
    } catch (error) {
      alert('Failed to load fines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fineService.updateFine(editingId, {
          ...formData,
          issued_date: new Date().toISOString().split('T')[0],
        });
        await activityService.logActivity('update', 'fine', editingId, 'Updated fine');
      } else {
        await fineService.createFine({
          ...formData,
          status: 'pending',
          issued_date: new Date().toISOString().split('T')[0],
        });
        await activityService.logActivity('create', 'fine', undefined, `Added fine of $${formData.amount}`);
      }

      await loadData();
      setShowForm(false);
      setFormData(emptyForm);
      setEditingId(null);
    } catch (error) {
      alert('Failed to save fine');
    }
  };

  const handleEdit = (fine: Fine) => {
    setFormData({
      rider_id: fine.rider_id,
      amount: fine.amount,
      description: fine.description || '',
      category: fine.category || 'violation',
      reason: fine.reason || '',
    });
    setEditingId(fine.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this fine?')) return;

    try {
      await fineService.deleteFine(id);
      await activityService.logActivity('delete', 'fine', id, 'Deleted fine');
      await loadData();
    } catch (error) {
      alert('Failed to delete fine');
    }
  };

  const getRiderName = (riderId: string): string => {
    const rider = riders.find((r) => r.id === riderId);
    return rider ? `${rider.first_name} ${rider.last_name}` : 'Unknown';
  };

  const getTotalFines = (riderId: string): number => {
    return fines
      .filter((fine) => fine.rider_id === riderId && fine.status === 'pending')
      .reduce((sum, fine) => sum + fine.amount, 0);
  };

  const groupedFines = riders.map((rider) => ({
    rider,
    fines: fines.filter((fine) => fine.rider_id === rider.id),
    totalFines: getTotalFines(rider.id),
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Fines & Penalties</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus size={20} />
          Add Fine
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingId ? 'Edit Fine' : 'Add New Fine'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rider</label>
                  <select
                    value={formData.rider_id}
                    onChange={(e) => setFormData({ ...formData, rider_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    required
                  >
                    <option value="">Select a rider</option>
                    {riders.map((rider) => (
                      <option key={rider.id} value={rider.id}>
                        {rider.first_name} {rider.last_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for fine..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Additional details..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none"
                    rows={2}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    {editingId ? 'Update' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData(emptyForm);
                      setEditingId(null);
                    }}
                    className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading fines...</div>
      ) : (
        <div className="space-y-4">
          {groupedFines.map(({ rider, fines: riderFines, totalFines }) =>
            riderFines.length > 0 ? (
              <div key={rider.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={24} className="text-red-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {rider.first_name} {rider.last_name}
                        </h3>
                        <p className="text-sm text-gray-600">{riderFines.length} fines</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Total Fines</p>
                      <p className="text-2xl font-bold text-red-600">${totalFines.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {riderFines.map((fine) => (
                    <div key={fine.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-gray-900">${fine.amount.toFixed(2)}</p>
                            <span className="px-2 py-1 bg-gray-200 text-gray-800 text-xs rounded font-semibold">
                              {fine.category}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs rounded font-semibold ${
                                fine.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-green-100 text-green-800'
                              }`}
                            >
                              {fine.status}
                            </span>
                          </div>
                          {fine.reason && (
                            <p className="text-sm text-gray-600">
                              <strong>Reason:</strong> {fine.reason}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            Issued: {new Date(fine.issued_date).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEdit(fine)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(fine.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null
          )}

          {groupedFines.every(({ fines: riderFines }) => riderFines.length === 0) && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              No fines recorded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
