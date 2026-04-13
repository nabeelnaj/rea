import { useEffect, useState } from 'react';
import { paymentService, Payment } from '../services/paymentService';
import { riderService, Rider } from '../services/riderService';
import { fineService } from '../services/fineService';
import { activityService } from '../services/activityService';
import { CreditCard, Plus, Check } from 'lucide-react';

interface FormData {
  rider_id: string;
  period_start: string;
  period_end: string;
  base_amount: number;
}

const emptyForm: FormData = {
  rider_id: '',
  period_start: '',
  period_end: '',
  base_amount: 0,
};

export function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FormData>(emptyForm);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, ridersData] = await Promise.all([
        paymentService.getAllPayments(),
        riderService.getAllRiders(),
      ]);
      setPayments(paymentsData);
      setRiders(ridersData);
    } catch (error) {
      alert('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const totalFines = await fineService.getTotalFinesByRider(formData.rider_id);
      const netAmount = formData.base_amount - totalFines;

      await paymentService.createPayment({
        ...formData,
        total_fines: totalFines,
        net_amount: netAmount,
        status: 'pending',
      });

      await activityService.logActivity(
        'create',
        'payment',
        undefined,
        `Payment created: $${formData.base_amount} base, $${totalFines} fines`
      );

      await loadData();
      setShowForm(false);
      setFormData(emptyForm);
    } catch (error) {
      alert('Failed to create payment');
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await paymentService.markAsPaid(id, new Date().toISOString().split('T')[0]);
      await activityService.logActivity('mark_as_paid', 'payment', id, 'Payment marked as paid');
      await loadData();
    } catch (error) {
      alert('Failed to mark payment as paid');
    }
  };

  const getRiderName = (riderId: string): string => {
    const rider = riders.find((r) => r.id === riderId);
    return rider ? `${rider.first_name} ${rider.last_name}` : 'Unknown';
  };

  const getStatusColor = (status: string) => {
    return status === 'paid'
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Payments</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus size={20} />
          Generate Payment
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Generate Payment</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rider</label>
                  <select
                    value={formData.rider_id}
                    onChange={(e) => setFormData({ ...formData, rider_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period Start
                  </label>
                  <input
                    type="date"
                    value={formData.period_start}
                    onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Period End
                  </label>
                  <input
                    type="date"
                    value={formData.period_end}
                    onChange={(e) => setFormData({ ...formData, period_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Base Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.base_amount}
                    onChange={(e) =>
                      setFormData({ ...formData, base_amount: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                    required
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Generate
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
        <div className="text-center py-12">Loading payments...</div>
      ) : (
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center text-gray-500">
              No payments yet
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <CreditCard size={20} className="text-green-600" />
                      <h3 className="text-lg font-bold text-gray-900">
                        {getRiderName(payment.rider_id)}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-gray-600">Period</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(payment.period_start).toLocaleDateString()} -{' '}
                          {new Date(payment.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Base Amount</p>
                        <p className="font-semibold text-gray-900">${payment.base_amount.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Fines Deducted</p>
                        <p className="font-semibold text-red-600">-${payment.total_fines.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Net Amount</p>
                        <p className="font-semibold text-green-600">${payment.net_amount.toFixed(2)}</p>
                      </div>
                    </div>

                    {payment.paid_date && (
                      <p className="text-sm text-gray-600">
                        Paid: {new Date(payment.paid_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {payment.status === 'pending' && (
                    <button
                      onClick={() => handleMarkAsPaid(payment.id)}
                      className="ml-4 p-2 bg-green-100 text-green-600 hover:bg-green-200 rounded-lg transition-colors"
                      title="Mark as paid"
                    >
                      <Check size={20} />
                    </button>
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
