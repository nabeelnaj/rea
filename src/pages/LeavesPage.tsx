import { useEffect, useState } from 'react';
import { leaveService, Leave } from '../services/leaveService';
import { riderService, Rider } from '../services/riderService';
import { activityService } from '../services/activityService';
import { useAuthStore } from '../store/authStore';
import { Check, X, Plus, Calendar } from 'lucide-react';

interface FormData {
  rider_id: string;
  start_date: string;
  end_date: string;
  reason: string;
}

const emptyForm: FormData = {
  rider_id: '',
  start_date: '',
  end_date: '',
  reason: '',
};

export function LeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesData, ridersData] = await Promise.all([
        leaveService.getAllLeaves(),
        riderService.getAllRiders(),
      ]);
      setLeaves(leavesData);
      setRiders(ridersData);
    } catch (error) {
      alert('Failed to load leaves');
    } finally {
      setLoading(false);
    }
  };

  const filteredLeaves = leaves.filter(
    (leave) => filter === 'all' || leave.status === filter
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await leaveService.createLeave({
        ...formData,
        status: 'pending',
        requested_at: new Date().toISOString(),
      });
      await activityService.logActivity('create', 'leave', undefined, `New leave request created`);
      await loadData();
      setShowForm(false);
      setFormData(emptyForm);
    } catch (error) {
      alert('Failed to create leave');
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await leaveService.approveLeave(id, user?.id || '', 'Approved');
      await activityService.logActivity('approve', 'leave', id, 'Leave approved');
      await loadData();
    } catch (error) {
      alert('Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await leaveService.rejectLeave(id, 'Rejected');
      await activityService.logActivity('reject', 'leave', id, 'Leave rejected');
      await loadData();
    } catch (error) {
      alert('Failed to reject leave');
    }
  };

  const getRiderName = (riderId: string): string => {
    const rider = riders.find((r) => r.id === riderId);
    return rider ? `${rider.first_name} ${rider.last_name}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Leave Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Add Leave
        </button>
      </div>

      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Leave</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rider</label>
                  <select
                    value={formData.rider_id}
                    onChange={(e) => setFormData({ ...formData, rider_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                  <textarea
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Reason for leave..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Create Leave
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setFormData(emptyForm);
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
        <div className="text-center py-12">Loading leaves...</div>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              No leaves found
            </div>
          ) : (
            filteredLeaves.map((leave) => (
              <div
                key={leave.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar size={20} className="text-blue-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {getRiderName(leave.rider_id)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(leave.status)}`}>
                        {leave.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-sm text-gray-600">Start Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(leave.start_date).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">End Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(leave.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {leave.reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Reason:</strong> {leave.reason}
                      </p>
                    )}
                  </div>

                  {leave.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(leave.id)}
                        className="p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                        title="Approve"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleReject(leave.id)}
                        className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                        title="Reject"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
