import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // ✅ Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  // ✅ Handle Login Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:3001/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
        }),
      });

      // ❌ If login fails
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Invalid login credentials");
      }

      // ✅ Success Response
      const data = await res.json();

      // ✅ Save JWT Token
      localStorage.setItem("admin-token", data.accessToken);

      // ✅ Redirect to Dashboard
      navigate("/admin/dashboard", { replace: true });
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card className="bg-card border-border">
          <CardHeader className="space-y-1 text-center pb-2">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4"
            >
              <Lock className="h-8 w-8 text-primary" />
            </motion.div>

            <CardTitle className="font-brand text-2xl font-semibold tracking-[0.1em]">
              ADMIN LOGIN
            </CardTitle>

            <p className="text-sm text-muted-foreground font-body">
              Enter your credentials to access the admin panel
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="font-body text-sm uppercase tracking-[0.1em]"
                >
                  Email
                </Label>

                <Input
                  id="email"
                  type="email"
                  placeholder="admin@matteekay.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="font-body"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="font-body text-sm uppercase tracking-[0.1em]"
                >
                  Password
                </Label>

                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="font-body"
                  required
                  autoComplete="off"
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-destructive font-body"
                >
                  {error}
                </motion.p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full font-body uppercase tracking-[0.1em]"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Hint */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground font-body text-center">
                Use your admin email and password registered in the backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
