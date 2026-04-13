import { useEffect, useState } from 'react';
import { riderService, Rider } from '../services/riderService';
import { leaveService } from '../services/leaveService';
import { fineService } from '../services/fineService';
import { paymentService } from '../services/paymentService';
import { FileText, Download } from 'lucide-react';

export function ReportsPage() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRiders();
  }, []);

  const loadRiders = async () => {
    try {
      const data = await riderService.getAllRiders();
      setRiders(data);
      if (data.length > 0) {
        setSelectedRiderId(data[0].id);
      }
    } catch (error) {
      alert('Failed to load riders');
    }
  };

  const generateReport = async () => {
    if (!selectedRiderId) return;

    try {
      setLoading(true);
      const [rider, leaves, fines, payments] = await Promise.all([
        riderService.getRiderById(selectedRiderId),
        leaveService.getLeavesByRider(selectedRiderId),
        fineService.getFinesByRider(selectedRiderId),
        paymentService.getPaymentsByRider(selectedRiderId),
      ]);

      const approvedLeaves = leaves.filter((l) => l.status === 'approved');
      const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
      const totalPayments = payments.reduce((sum, p) => sum + p.net_amount, 0);

      setReportData({
        rider,
        leaves: approvedLeaves,
        fines,
        payments,
        totalFines,
        totalPayments,
      });
    } catch (error) {
      alert('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!reportData) return;

    const content = `
REAR HR PORTAL - RIDER REPORT
=============================

Rider Information
-----------------
Name: ${reportData.rider.first_name} ${reportData.rider.last_name}
Email: ${reportData.rider.email}
Phone: ${reportData.rider.phone || 'N/A'}
Joining Date: ${reportData.rider.joining_date || 'N/A'}
Base Salary: $${reportData.rider.base_salary.toFixed(2)}
Status: ${reportData.rider.status}

Leaves Summary
--------------
Total Approved Leaves: ${reportData.leaves.length}
${reportData.leaves.map((leave) => `- ${new Date(leave.start_date).toLocaleDateString()} to ${new Date(leave.end_date).toLocaleDateString()}: ${leave.reason || 'No reason'}`).join('\n')}

Fines & Penalties
-----------------
Total Amount: $${reportData.totalFines.toFixed(2)}
${reportData.fines.map((fine) => `- $${fine.amount.toFixed(2)} (${fine.category}): ${fine.reason || 'No reason'}`).join('\n')}

Payment Records
---------------
Total Payments: ${reportData.payments.length}
Total Paid Amount: $${reportData.totalPayments.toFixed(2)}
${reportData.payments.map((payment) => `- Period ${new Date(payment.period_start).toLocaleDateString()} to ${new Date(payment.period_end).toLocaleDateString()}: $${payment.net_amount.toFixed(2)} (Status: ${payment.status})`).join('\n')}

Generated: ${new Date().toLocaleString()}
    `;

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    element.setAttribute('download', `${reportData.rider.first_name}_${reportData.rider.last_name}_report.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Reports</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Rider Report</h2>

        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Rider</label>
            <select
              value={selectedRiderId}
              onChange={(e) => setSelectedRiderId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              {riders.map((rider) => (
                <option key={rider.id} value={rider.id}>
                  {rider.first_name} {rider.last_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </div>
      </div>

      {reportData && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {reportData.rider.first_name} {reportData.rider.last_name}
                </h2>
                <p className="text-gray-600">{reportData.rider.email}</p>
              </div>
              <button
                onClick={downloadPDF}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download size={20} />
                Download Report
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">Base Salary</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">
                  ${reportData.rider.base_salary.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Approved Leaves</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{reportData.leaves.length}</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Fines</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  ${reportData.totalFines.toFixed(2)}
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-sm text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">
                  ${reportData.totalPayments.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Leaves ({reportData.leaves.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportData.leaves.length === 0 ? (
                  <p className="text-gray-500">No approved leaves</p>
                ) : (
                  reportData.leaves.map((leave) => (
                    <div key={leave.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold text-gray-900">
                        {new Date(leave.start_date).toLocaleDateString()} -{' '}
                        {new Date(leave.end_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">{leave.reason}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} />
                Fines ({reportData.fines.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {reportData.fines.length === 0 ? (
                  <p className="text-gray-500">No fines recorded</p>
                ) : (
                  reportData.fines.map((fine) => (
                    <div key={fine.id} className="p-3 bg-red-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-900">${fine.amount.toFixed(2)}</p>
                          <p className="text-sm text-gray-600">{fine.category}</p>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(fine.issued_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Payment Records ({reportData.payments.length})
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {reportData.payments.length === 0 ? (
                <p className="text-gray-500">No payment records</p>
              ) : (
                reportData.payments.map((payment) => (
                  <div key={payment.id} className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">
                          ${payment.net_amount.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(payment.period_start).toLocaleDateString()} -{' '}
                          {new Date(payment.period_end).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          payment.status === 'paid'
                            ? 'bg-green-200 text-green-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {payment.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
