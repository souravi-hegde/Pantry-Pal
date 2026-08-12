import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Package,
  ChefHat,
  Trash2,
  BarChart3,
  Settings,
  HelpCircle,
  User,
} from "lucide-react";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Inventory", path: "/inventory", icon: Package },
  { title: "Recipe Suggestions", path: "/recipes", icon: ChefHat },
  { title: "Waste Tracking", path: "/waste", icon: Trash2 },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
  { title: "Settings", path: "/settings", icon: Settings },
  { title: "Help & Support", path: "/profile", icon: HelpCircle },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center">
            <Package className="w-6 h-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-brand">PantryPal</h1>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
            activeClassName="bg-primary text-primary-foreground font-medium shadow-soft"
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
