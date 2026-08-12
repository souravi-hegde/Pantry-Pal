import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Waste() {
  const navigate = useNavigate();
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");

  // Fetch waste logs on page load
  useEffect(() => {
    const fetchWasteLogs = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch("http://localhost:3001/api/waste-log", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setLogs(data || []);
        } else {
          console.error("Failed to fetch waste logs");
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching waste logs:", error);
        setIsLoading(false);
      }
    };

    fetchWasteLogs();
  }, [navigate]);

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Filter logs based on action type
  const filteredLogs = filterAction === "all"
    ? logs
    : logs.filter((log) => log.action.toUpperCase() === filterAction.toUpperCase());

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary mr-3" />
          <p className="text-muted-foreground">Loading waste logs...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Waste Tracking</h1>
          <p className="text-muted-foreground">Track items you've used or wasted</p>
        </div>

        <div className="flex gap-4">
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-48 h-12 rounded-2xl">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="used">Used</SelectItem>
              <SelectItem value="wasted">Wasted</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filteredLogs.length === 0 ? (
          <Card className="p-12 rounded-3xl shadow-card text-center">
            <p className="text-muted-foreground text-lg">
              No waste or usage has been logged yet.
            </p>
          </Card>
        ) : (
          <Card className="rounded-3xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-accent/10 border-b border-border">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Item</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Quantity</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Action</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log, index) => (
                    <tr key={index} className="border-b border-border hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{log.itemName}</td>
                      <td className="px-6 py-4 text-foreground">{log.quantity}</td>
                      <td className="px-6 py-4">
                        <Badge className={`rounded-xl px-3 py-1 ${
                          log.action === "USED"
                            ? "bg-success text-success-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }`}>
                          {log.action === "USED" ? "Used" : "Wasted"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-foreground">{formatDate(log.date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
