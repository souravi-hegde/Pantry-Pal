import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Pencil, Trash2, Check, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Inventory() {
  const navigate = useNavigate();
  const [lastUserEmail, setLastUserEmail] = useState<string | null>(null);

  // State for items
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Fetch items function
  const fetchItems = async (search = "") => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const url = new URL('http://localhost:3001/api/items');
      if (search) {
        url.searchParams.append('search', search);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setItems(data);
      } else {
        console.error('Failed to fetch items');
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching items:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if user has changed
    const userEmail = localStorage.getItem('userEmail');
    
    if (lastUserEmail !== userEmail) {
      setLastUserEmail(userEmail);
      // Reset items when user changes (on login/logout)
      setItems([]);
      setLoading(true);
      fetchItems();
    }
  }, [lastUserEmail]);

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    fetchItems(value);
  };

  // Handle delete
  const handleDelete = async (itemId: string, itemName: string) => {
    if (!confirm(`Are you sure you want to delete "${itemName}"?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Item deleted successfully!');
        fetchItems(searchQuery);
      } else {
        const errorData = await response.json();
        alert(`Failed to delete item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item: Unable to connect to server');
    }
  };

  // Handle mark as used
  const handleMarkUsed = async (itemId: string, itemName: string) => {
    if (!confirm(`Mark "${itemName}" as used?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}/mark-used`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Used' })
      });

      if (response.ok) {
        alert('Item marked as used!');
        fetchItems(searchQuery);
      } else {
        const errorData = await response.json();
        alert(`Failed to mark as used: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking item as used:', error);
      alert('Failed to mark as used: Unable to connect to server');
    }
  };

  // Handle mark as wasted
  const handleMarkWasted = async (itemId: string, itemName: string) => {
    if (!confirm(`Mark "${itemName}" as wasted?`)) {
      return;
    }

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/api/items/${itemId}/mark-wasted`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Wasted/Expired' })
      });

      if (response.ok) {
        alert('Item marked as wasted!');
        fetchItems(searchQuery);
      } else {
        const errorData = await response.json();
        alert(`Failed to mark as wasted: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error marking item as wasted:', error);
      alert('Failed to mark as wasted: Unable to connect to server');
    }
  };

  // Helper function to calculate days left until expiry
  const calculateDaysLeft = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to get status based on days left
  const getStatus = (daysLeft: number) => {
    if (daysLeft < 0) return "expired";
    if (daysLeft <= 3) return "near-expiry";
    return "fresh";
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "fresh":
        return "bg-success text-success-foreground";
      case "near-expiry":
        return "bg-status-nearExpiry text-foreground";
      case "expired":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  // Filter items based on category and status
  const filteredItems = items.filter((item: any) => {
    const daysLeft = calculateDaysLeft(item.expiryDate);
    const status = getStatus(daysLeft);

    // Category filter
    if (categoryFilter !== "all") {
      const itemCategory = item.category?.name?.toLowerCase() || "uncategorized";
      if (itemCategory !== categoryFilter.toLowerCase()) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== "all") {
      if (status !== statusFilter) {
        return false;
      }
    }

    return true;
  });

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Inventory</h1>
            <p className="text-muted-foreground">Manage all your pantry items</p>
          </div>
          <Button onClick={() => navigate("/inventory/add")} className="h-12 px-6 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
            <Plus className="w-5 h-5 mr-2" strokeWidth={1.5} />
            Add Item
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
            <Input
              placeholder="Search items..."
              className="pl-12 h-12 rounded-2xl"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48 h-12 rounded-2xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="dairy">Dairy</SelectItem>
              <SelectItem value="fruits">Fruits</SelectItem>
              <SelectItem value="vegetables">Vegetables</SelectItem>
              <SelectItem value="meat">Meat</SelectItem>
              <SelectItem value="grains">Grains</SelectItem>
              <SelectItem value="beverages">Beverages</SelectItem>
              <SelectItem value="snacks">Snacks</SelectItem>
              <SelectItem value="condiments">Condiments</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 h-12 rounded-2xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="fresh">Fresh</SelectItem>
              <SelectItem value="near-expiry">Near Expiry</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-3xl shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-primary/10 border-b border-border">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Quantity</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Expiry Date</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Days Left</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Loading items...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="space-y-3">
                        <p className="text-muted-foreground text-lg">
                          {items.length === 0 ? "Your pantry is empty!" : "No items match your filters"}
                        </p>
                        <p className="text-muted-foreground text-sm">
                          {items.length === 0 ? "Click \"Add Item\" to get started." : "Try adjusting your search or filters"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item: any) => {
                    const daysLeft = calculateDaysLeft(item.expiryDate);
                    const status = getStatus(daysLeft);

                    return (
                      <tr key={item.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 font-medium text-foreground">{item.name}</td>
                        <td className="px-6 py-4 text-foreground">{item.quantity} {item.unit || ''}</td>
                        <td className="px-6 py-4 text-muted-foreground">{item.category?.name || 'N/A'}</td>
                        <td className="px-6 py-4 text-foreground">{formatDate(item.expiryDate)}</td>
                        <td className="px-6 py-4 text-foreground">{daysLeft < 0 ? "Expired" : `${daysLeft} days`}</td>
                        <td className="px-6 py-4">
                          <Badge className={`rounded-xl px-3 py-1 ${getStatusBadge(status)}`}>
                            {status.replace("-", " ")}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-xl hover:bg-success/20"
                              onClick={() => handleMarkUsed(item.id, item.name)}
                              title="Mark as used"
                            >
                              <Check className="w-4 h-4 text-success-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-xl hover:bg-destructive/20"
                              onClick={() => handleMarkWasted(item.id, item.name)}
                              title="Mark as wasted"
                            >
                              <X className="w-4 h-4 text-destructive-foreground" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-xl hover:bg-primary/20"
                              onClick={() => navigate(`/inventory/edit/${item.id}`)}
                              title="Edit item"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="rounded-xl hover:bg-destructive/20"
                              onClick={() => handleDelete(item.id, item.name)}
                              title="Delete item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
