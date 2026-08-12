import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    try {
      // Send POST request to backend register endpoint
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      // Check if registration was successful
      if (response.ok) {
        // Show success message
        alert('Signup successful! Please log in.');

        // Redirect to login page
        navigate("/");
      } else {
        // Registration failed - show error message
        const errorData = await response.json();
        alert(`Signup failed: ${errorData.message || 'Email already in use'}`);
      }
    } catch (error) {
      // Network or other error
      alert('Signup failed: Unable to connect to server');
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary/20 via-background to-accent/20 p-8">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-card backdrop-blur-sm bg-card/95">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-secondary flex items-center justify-center mb-4">
            <Package className="w-9 h-9 text-secondary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground">Join PantryPal today</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12 rounded-2xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="h-12 rounded-2xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="h-12 rounded-2xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="h-12 rounded-2xl"
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-soft">
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-muted-foreground">Already have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-secondary-foreground font-medium hover:underline"
            >
              Log In
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
