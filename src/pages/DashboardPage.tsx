import { useEffect, useState } from 'react';
import { riderService } from '../services/riderService';
import { leaveService } from '../services/leaveService';
import { fineService } from '../services/fineService';
import { activityService, ActivityLog } from '../services/activityService';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';

interface DashboardStats {
  totalRiders: number;
  activeLeavesToday: number;
  pendingFines: number;
  totalFinesAmount: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRiders: 0,
    activeLeavesToday: 0,
    pendingFines: 0,
    totalFinesAmount: 0,
  });
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [riders, leaves, fines, logs] = await Promise.all([
          riderService.getAllRiders(),
          leaveService.getAllLeaves(),
          fineService.getAllFines(),
          activityService.getActivityLogs(),
        ]);

        const today = new Date().toISOString().split('T')[0];
        const activeTodayLeaves = leaves.filter(
          (leave) =>
            leave.status === 'approved' &&
            leave.start_date <= today &&
            leave.end_date >= today
        ).length;

        const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);

        setStats({
          totalRiders: riders.length,
          activeLeavesToday: activeTodayLeaves,
          pendingFines: fines.filter((f) => f.status === 'pending').length,
          totalFinesAmount: totalFines,
        });

        setActivities(logs);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ComponentType<{ size: number }>;
    label: string;
    value: number | string;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="p-3 rounded-lg" style={{ backgroundColor: color + '20' }}>
          <Icon size={28} color={color} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold text-gray-900 mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Riders"
          value={stats.totalRiders}
          color="#3B82F6"
        />
        <StatCard
          icon={Calendar}
          label="Active Leaves Today"
          value={stats.activeLeavesToday}
          color="#10B981"
        />
        <StatCard
          icon={AlertCircle}
          label="Pending Fines"
          value={stats.pendingFines}
          color="#F59E0B"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Fines Amount"
          value={`$${stats.totalFinesAmount.toFixed(2)}`}
          color="#EF4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activities</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No activities yet</p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">
                      {activity.action} - {activity.entity_type}
                    </p>
                    {activity.details && (
                      <p className="text-gray-600 text-xs mt-1 truncate">{activity.details}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Average Riders per Month</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {stats.totalRiders > 0 ? stats.totalRiders : 0}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Healthy Attendance</p>
              <p className="text-2xl font-bold text-green-600 mt-1">98%</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Pending Actions</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.pendingFines}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
