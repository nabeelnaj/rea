import { Settings as SettingsIcon } from 'lucide-react';

export function SettingsPage() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <SettingsIcon size={24} />
            System Settings
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Name
              </label>
              <input
                type="text"
                value="Rear HR Portal"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Version</label>
              <input
                type="text"
                value="1.0.0"
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Currency
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none">
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>GBP (£)</option>
              </select>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Save Settings
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Information</h2>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Last Backup</p>
              <p className="text-lg font-semibold text-blue-600 mt-1">
                {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">System Status</p>
              <p className="text-lg font-semibold text-green-600 mt-1">Operational</p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Database</p>
              <p className="text-lg font-semibold text-gray-900 mt-1">Connected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About Rear HR Portal</h2>
        <p className="text-gray-600 mb-4">
          Rear is a comprehensive HR management system designed specifically for managing riders and
          their employment records, leave requests, fines, and payment processing.
        </p>
        <p className="text-gray-600">
          The system provides administrators with tools to efficiently manage rider information,
          track leaves, apply fines, generate payments, and create detailed reports for payroll and
          compliance purposes.
        </p>
      </div>
    </div>
  );
}
