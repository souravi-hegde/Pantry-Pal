import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { TrendingDown, TrendingUp, Percent, Loader } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Analytics() {
  const navigate = useNavigate();
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch analytics data on page load
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch("http://localhost:3001/api/analytics/summary", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setAnalyticsData(data);
        } else {
          console.error("Failed to fetch analytics data");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [navigate]);

  // Loading state
  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary mr-3" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </AppLayout>
    );
  }

  // Default data if none loaded
  const wasteVsUsedData = analyticsData?.wasteVsUsed || { used: 0, wasted: 0 };
  const top5Wasted = analyticsData?.top5Wasted || [];

  // Format data for Waste vs Used chart
  const wasteVsUsedChartData = [
    { name: "Used", value: wasteVsUsedData.used },
    { name: "Wasted", value: wasteVsUsedData.wasted },
  ];

  // Colors for pie chart
  const COLORS = ["#22c55e", "#ef4444"];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Analytics</h1>
            <p className="text-muted-foreground">Track your pantry usage and waste patterns</p>
          </div>
          <Select>
            <SelectTrigger className="w-48 h-12 rounded-2xl">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <KPICard
            title="Total Wasted"
            value={Math.round(wasteVsUsedData.wasted)}
            icon={TrendingDown}
            bgColor="bg-destructive/30"
            iconColor="bg-destructive text-destructive-foreground"
          />
          <KPICard
            title="Total Used"
            value={Math.round(wasteVsUsedData.used)}
            icon={TrendingUp}
            bgColor="bg-success/30"
            iconColor="bg-success text-success-foreground"
          />
          <KPICard
            title="Waste Ratio"
            value={
              wasteVsUsedData.used + wasteVsUsedData.wasted > 0
                ? Math.round(
                    (wasteVsUsedData.wasted / (wasteVsUsedData.used + wasteVsUsedData.wasted)) * 100
                  )
                : 0
            }
            icon={Percent}
            bgColor="bg-primary/30"
            iconColor="bg-primary text-primary-foreground"
            suffix="%"
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Waste vs Used Chart */}
          <Card className="p-6 rounded-3xl shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-6">Waste vs Used</h2>
            {wasteVsUsedChartData.some((item) => item.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={wasteVsUsedChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {wasteVsUsedChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>No data available yet</p>
              </div>
            )}
          </Card>

          {/* Top 5 Wasted Items Chart */}
          <Card className="p-6 rounded-3xl shadow-card">
            <h2 className="text-xl font-semibold text-foreground mb-6">Top 5 Wasted Items</h2>
            {top5Wasted.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={top5Wasted}>
                  <XAxis dataKey="itemName" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#ef4444" name="Quantity Wasted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                <p>No wasted items yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
