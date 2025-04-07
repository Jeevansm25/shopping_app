"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import Link from "next/link";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    // Validation
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Admin registration validation is temporarily disabled
    /* 
    if (role === "admin") {
      if (!adminCode) {
        setError("Admin code is required for admin registration");
        toast({
          title: "Error",
          description: "Admin code is required for admin registration",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (adminCode !== process.env.NEXT_PUBLIC_ADMIN_CODE) {
        setError("Invalid admin code");
        toast({
          title: "Error",
          description: "Invalid admin code",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    */

    try {
      const result = await register(name, email, password, role);

      if (result.success) {
        toast({
          title: "Success",
          description: "Registration successful!",
        });
        // Redirect based on role
        if (role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/courses");
        }
      } else {
        setError(result.error || "Registration failed");
        toast({
          title: "Error",
          description: result.error || "Registration failed",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An unexpected error occurred");
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Card className="max-w-md mx-auto mt-10 p-6">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">Register</h2>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Register as</Label>
              <RadioGroup
                value={role}
                onValueChange={setRole}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user">Regular User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin">Admin</Label>
                </div>
              </RadioGroup>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                <strong className="font-bold">Error: </strong>
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Register"}
              <ArrowRight className="ml-2" />
            </Button>
          </form>

          <p className="mt-4 text-sm text-center">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
