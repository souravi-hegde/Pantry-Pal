import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [leadTime, setLeadTime] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings on page load
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch("http://localhost:3001/api/settings", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLeadTime(data.expiryLeadTime || 3);
        } else {
          console.error("Failed to fetch settings");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching settings:", error);
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [navigate]);

  // Handle saving settings
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      setIsSaving(true);

      const response = await fetch("http://localhost:3001/api/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ expiryLeadTime: parseInt(leadTime.toString()) }),
      });

      if (response.ok) {
        alert("Settings saved successfully!");
      } else {
        const errorData = await response.json();
        alert(`Failed to save settings: ${errorData.message || "Unknown error"}`);
      }
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings: Unable to connect to server");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary mr-3" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground">Manage your PantryPal preferences</p>
        </div>

        <Card className="p-8 rounded-3xl shadow-card space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-6">Expiry Notifications</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">Notification Lead Time (days)</Label>
                  <p className="text-sm text-muted-foreground">
                    You'll be notified this many days before items expire
                  </p>
                </div>
                <Input
                  type="number"
                  min="1"
                  max="30"
                  value={leadTime}
                  onChange={(e) => setLeadTime(parseInt(e.target.value) || 1)}
                  className="w-24 h-12 rounded-2xl text-center"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                For example: If you set this to 3 days, you'll receive notifications for items expiring within the next 3 days.
              </p>
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
