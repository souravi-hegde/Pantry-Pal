import { useState, useEffect } from "react";
import { Search, Bell, User, LogOut, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

export const TopBar = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("User");
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    // Get user name from localStorage
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    }
  }, []);

  // Fetch notifications on page load
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return;
        }

        const response = await fetch('http://localhost:3001/api/notifications', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');

    // Redirect to login
    navigate("/");
  };

  // Get user initials
  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Handle marking notifications as read
  const handleMarkAsRead = async (notificationIds: string[]) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch('http://localhost:3001/api/notifications/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds })
      });

      // Clear notifications after marking as read
      setNotifications([]);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  return (
    <header className="h-20 border-b border-border bg-card flex items-center justify-between px-8 shadow-soft">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <Input
            placeholder="Search items, recipes, or categories..."
            className="pl-12 h-12 rounded-2xl border-border bg-muted/50 focus:bg-card"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notification Bell Button */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="relative w-11 h-11 rounded-2xl bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Bell className="w-5 h-5 text-foreground" strokeWidth={1.5} />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full"></span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-2xl shadow-lg z-50">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <button
                  onClick={() => setIsDropdownOpen(false)}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              {notifications.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id || index}
                      className="p-4 border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                  <div className="p-3 border-t border-border">
                    <button
                      onClick={() => handleMarkAsRead(notifications.map((n: any) => n.id))}
                      className="w-full py-2 px-3 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                      Mark All as Read
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <p>No notifications yet</p>
                </div>
              )}
            </div>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="w-11 h-11 rounded-2xl cursor-pointer hover:opacity-80 transition-opacity">
                <AvatarFallback className="bg-primary text-primary-foreground rounded-2xl font-medium">
                  <User className="w-5 h-5" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 rounded-2xl" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {localStorage.getItem('userEmail') || 'user@example.com'}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
