import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { Package, AlertTriangle, XCircle, Plus, List, ChefHat, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [lastUserEmail, setLastUserEmail] = useState<string | null>(null);

  // State for KPIs
  const [kpis, setKpis] = useState({
    totalItems: 0,
    nearExpiry: 0,
    expired: 0
  });

  // State for expiring items
  const [expiringItems, setExpiringItems] = useState([]);

  // State for loading
  const [loading, setLoading] = useState(true);

  // Function to fetch dashboard data (used in useEffect and after mark actions)
  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate("/");
        return;
      }

      // Reset state to clear previous user's data
      setKpis({
        totalItems: 0,
        nearExpiry: 0,
        expired: 0
      });
      setExpiringItems([]);
      setLoading(true);

      // Fetch KPIs
      const kpisResponse = await fetch('http://localhost:3001/api/dashboard/kpis', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (kpisResponse.ok) {
        const kpisData = await kpisResponse.json();
        setKpis(kpisData);
      }

      // Fetch expiring items
      const expiringResponse = await fetch('http://localhost:3001/api/dashboard/expiring-soon', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (expiringResponse.ok) {
        const expiringData = await expiringResponse.json();
        setExpiringItems(expiringData);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check for token and user email
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    // If no token, redirect to login
    if (!token) {
      navigate("/");
      return;
    }

    // Check if user has changed
    if (lastUserEmail !== userEmail) {
      setLastUserEmail(userEmail);
      fetchDashboardData();
    }
  }, [navigate, lastUserEmail]);

  // Helper function to calculate days left until expiry
  const calculateDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle marking an item as used
  const handleMarkUsed = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in');
        navigate("/");
        return;
      }

      const response = await fetch(`http://localhost:3001/api/items/${itemId}/mark-used`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh dashboard data after successful mark used
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to mark item as used: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking item as used:', error);
      alert('Failed to mark item as used: Unable to connect to server');
    }
  };

  // Handle marking an item as wasted
  const handleMarkWasted = async (itemId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('You must be logged in');
        navigate("/");
        return;
      }

      const response = await fetch(`http://localhost:3001/api/items/${itemId}/mark-wasted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Refresh dashboard data after successful mark wasted
        await fetchDashboardData();
      } else {
        const errorData = await response.json();
        alert(`Failed to mark item as wasted: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking item as wasted:', error);
      alert('Failed to mark item as wasted: Unable to connect to server');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening in your pantry.</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <KPICard
            title="Total Items"
            value={kpis.totalItems}
            icon={Package}
            bgColor="bg-success/30"
            iconColor="bg-success text-success-foreground"
          />
          <KPICard
            title="Near Expiry"
            value={kpis.nearExpiry}
            icon={AlertTriangle}
            bgColor="bg-status-nearExpiry/30"
            iconColor="bg-status-nearExpiry text-foreground"
          />
          <KPICard
            title="Expired"
            value={kpis.expired}
            icon={XCircle}
            bgColor="bg-destructive/30"
            iconColor="bg-destructive text-destructive-foreground"
          />
        </div>

        <div className="flex gap-4">
          <Button onClick={() => navigate("/inventory/add")} className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
            <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Add Item
          </Button>
          <Button onClick={() => navigate("/inventory")} variant="outline" className="h-12 px-6 rounded-2xl border-secondary bg-secondary/20 text-secondary-foreground hover:bg-secondary/30">
            <List className="w-5 h-5 mr-2" strokeWidth={1.5} />
            View Inventory
          </Button>
          <Button onClick={() => navigate("/recipes")} variant="outline" className="h-12 px-6 rounded-2xl border-accent bg-accent/20 text-accent-foreground hover:bg-accent/30">
            <ChefHat className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Find Recipes
          </Button>
        </div>

        <Card className="p-6 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-foreground">Items Expiring Soon</h2>
            <Button variant="ghost" onClick={() => navigate("/inventory")} className="rounded-2xl">
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {expiringItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No items expiring soon</p>
            ) : (
              expiringItems.map((item: any) => {
                const daysLeft = calculateDaysLeft(item.expiryDate);
                const isExpired = daysLeft < 0;

                return (
                  <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.unit || ''} • Expires {formatDate(item.expiryDate)}
                        </p>
                      </div>
                      <Badge className={`rounded-xl px-3 py-1 ${
                        isExpired
                          ? "bg-destructive/80 text-destructive-foreground"
                          : "bg-status-nearExpiry/80 text-foreground"
                      }`}>
                        {isExpired ? "Expired" : `${daysLeft} days left`}
                      </Badge>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button size="sm" variant="ghost" className="rounded-xl bg-success/20 hover:bg-success/30 text-success-foreground" onClick={() => handleMarkUsed(item.id)}>
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="rounded-xl bg-destructive/20 hover:bg-destructive/30 text-destructive-foreground" onClick={() => handleMarkWasted(item.id)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
