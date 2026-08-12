import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Send POST request to backend login endpoint
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      // Check if login was successful
      if (response.ok) {
        // Parse the JSON response
        const data = await response.json();

        // Save the token and user data to localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.name || 'User');
        localStorage.setItem('userEmail', data.user.email);

        // Redirect to dashboard
        navigate("/dashboard");
      } else {
        // Login failed - show error message
        const errorData = await response.json();
        alert(`Login failed: ${errorData.message || 'Invalid email or password'}`);
      }
    } catch (error) {
      // Network or other error
      alert('Login failed: Unable to connect to server');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-secondary/20 p-8">
      <Card className="w-full max-w-md p-8 rounded-3xl shadow-card backdrop-blur-sm bg-card/95">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl bg-primary flex items-center justify-center mb-4">
            <Package className="w-9 h-9 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 font-brand">Welcome to PantryPal</h1>
          <p className="text-muted-foreground">Sign in to manage your pantry</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 rounded-2xl"
              required
            />
          </div>

          <Button type="submit" className="w-full h-12 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft">
            Log In
          </Button>

          <div className="text-center">
            <span className="text-muted-foreground">Don't have an account? </span>
            <button
              type="button"
              onClick={() => navigate("/signup")}
              className="text-primary-foreground font-medium hover:underline"
            >
              Sign Up
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
