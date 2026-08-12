import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useNavigate, useParams } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EditItem() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    quantity: "",
    unit: "",
    category: "",
    purchaseDate: "",
    expiryDate: "",
    notes: "",
  });

  // Fetch item data
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You must be logged in to edit items');
      navigate("/");
      return;
    }

    const fetchItem = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/items/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const item = await response.json();

          // Format dates for input fields
          const formatDate = (dateString: string) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            return date.toISOString().split('T')[0];
          };

          setFormData({
            name: item.name || "",
            quantity: item.quantity?.toString() || "",
            unit: item.unit || "",
            category: item.category?.name || "",
            purchaseDate: formatDate(item.purchaseDate),
            expiryDate: formatDate(item.expiryDate),
            notes: item.notes || "",
          });
          setLoading(false);
        } else {
          const errorData = await response.json();
          alert(`Failed to load item: ${errorData.message || 'Unknown error'}`);
          navigate("/inventory");
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        alert('Failed to load item: Unable to connect to server');
        navigate("/inventory");
      }
    };

    fetchItem();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Get token from localStorage
    const token = localStorage.getItem('token');

    if (!token) {
      alert('You must be logged in to edit items');
      navigate("/");
      return;
    }

    try {
      // Make PUT request to update item
      const response = await fetch(`http://localhost:3001/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          quantity: parseFloat(formData.quantity),
          unit: formData.unit || null,
          purchaseDate: formData.purchaseDate || null,
          expiryDate: formData.expiryDate,
          notes: formData.notes || null,
          category: formData.category || null
        })
      });

      if (response.ok) {
        // Success! Navigate back to inventory
        alert('Item updated successfully!');
        navigate("/inventory");
      } else {
        // Error
        const errorData = await response.json();
        alert(`Failed to update item: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item: Unable to connect to server');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading item...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Edit Item</h1>
          <p className="text-muted-foreground">Update item details in your pantry inventory</p>
        </div>

        <Card className="p-8 rounded-3xl shadow-card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Item Name</Label>
              <Input
                id="name"
                placeholder="e.g., Milk, Apples, Chicken"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-2xl"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  placeholder="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit || ""}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger className="h-12 rounded-2xl">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">Grams (g)</SelectItem>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    <SelectItem value="l">Liters (L)</SelectItem>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="purchaseDate">Purchase Date</Label>
                <Input
                  id="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                  className="h-12 rounded-2xl"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                  className="h-12 rounded-2xl"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="rounded-2xl min-h-24"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
                Update Item
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/inventory")} className="flex-1 h-12 rounded-2xl">
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
