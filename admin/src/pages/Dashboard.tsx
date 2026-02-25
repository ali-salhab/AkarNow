import { useEffect, useState } from "react";
import {
  Users,
  Building2,
  Heart,
  MapPin,
  Eye,
  TrendingUp,
  Star,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { adminAPI } from "../services/api";
import StatsCard from "../components/StatsCard";
import type { DashboardStats } from "../types";

const PIE_COLORS = [
  "#1A3C6E",
  "#1A85E6",
  "#0EC6E3",
  "#22C55E",
  "#F59E0B",
  "#EF4444",
];

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => {
        setStats(res.data.data);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card h-64" />
          <div className="card h-64" />
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-gray-500">تعذّر تحميل البيانات.</p>;

  const { overview, charts } = stats;

  // Merge daily users + properties into single timeline
  const allDates = Array.from(
    new Set([
      ...charts.dailyUsers.map((d) => d._id),
      ...charts.dailyProperties.map((d) => d._id),
    ]),
  ).sort();

  const activityData = allDates.map((date) => ({
    date: date.slice(5), // MM-DD
    users: charts.dailyUsers.find((d) => d._id === date)?.count || 0,
    properties: charts.dailyProperties.find((d) => d._id === date)?.count || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={overview.totalUsers}
          change={overview.newUsersThisMonth}
          changeLabel="جديد هذا الشهر"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          delay={100}
        />
        <StatsCard
          icon={Building2}
          label="إجمالي العقارات"
          value={overview.totalProperties}
          change={overview.newPropertiesThisMonth}
          changeLabel="جديد هذا الشهر"
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          delay={200}
        />
        <StatsCard
          icon={Activity}
          label="العقارات النشطة"
          value={overview.activeProperties}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          delay={300}
        />
        <StatsCard
          icon={Star}
          label="المميزة"
          value={overview.featuredProperties}
          iconBg="bg-yellow-50"
          iconColor="text-yellow-600"
          delay={400}
        />
        <StatsCard
          icon={Heart}
          label="إجمالي المفضلات"
          value={overview.totalFavorites}
          iconBg="bg-red-50"
          iconColor="text-red-500"
          delay={500}
        />
        <StatsCard
          icon={Eye}
          label="إجمالي المشاهدات"
          value={overview.totalViews}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          delay={600}
        />
        <StatsCard
          icon={MapPin}
          label="المدن النشطة"
          value={overview.totalCities}
          iconBg="bg-accent/10"
          iconColor="text-accent"
          delay={700}
        />
        <StatsCard
          icon={TrendingUp}
          label="نسبة التحويل"
          value={`${overview.totalProperties > 0 ? Math.round((overview.activeProperties / overview.totalProperties) * 100) : 0}%`}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
          delay={800}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart — spans 2 cols */}
        <div className="card p-6 lg:col-span-2 animate-fadeInUp delay-200">
          <h3 className="text-sm font-bold text-gray-700 mb-4">
            النشاط (آخر 7 أيام)
          </h3>
          {activityData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              لا توجد بيانات
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    fontSize: 12,
                  }}
                />
                <Bar
                  dataKey="users"
                  name="مستخدمون جدد"
                  fill="#1A3C6E"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Bar
                  dataKey="properties"
                  name="عقارات جديدة"
                  fill="#0EC6E3"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  iconType="circle"
                  iconSize={8}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Property Type Pie */}
        <div className="card p-6 animate-fadeInUp delay-300">
          <h3 className="text-sm font-bold text-gray-700 mb-4">
            أنواع العقارات
          </h3>
          {charts.propertyByType.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
              لا توجد بيانات
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={charts.propertyByType}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {charts.propertyByType.map((_, index) => (
                    <Cell
                      key={index}
                      fill={PIE_COLORS[index % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "none",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                  iconType="circle"
                  iconSize={8}
                  formatter={(value) =>
                    (value as string).charAt(0).toUpperCase() +
                    (value as string).slice(1)
                  }
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Cities */}
      <div className="card p-6 animate-fadeInUp delay-400">
        <h3 className="text-sm font-bold text-gray-700 mb-4">
          أكثر المدن نشاطاً
        </h3>
        {charts.topCities.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-6">
            لا توجد بيانات
          </p>
        ) : (
          <div className="space-y-3">
            {charts.topCities.map((city, i) => {
              const max = charts.topCities[0]?.count || 1;
              const pct = Math.round((city.count / max) * 100);
              return (
                <div key={city._id} className="flex items-center gap-4">
                  <span className="w-5 text-xs text-gray-400 font-semibold text-right">
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-700">
                        {city.name}
                      </span>
                      <span className="text-gray-400">{city.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary-600 to-accent transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
