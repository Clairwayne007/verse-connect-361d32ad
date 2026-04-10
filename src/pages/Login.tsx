import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        toast({ title: "Welcome back!", description: "Login successful" });
        
        // Get user from the session that login() just created
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        const userId = currentSession?.user?.id;
        
        if (userId) {
          const { data: roleData } = await supabase.rpc("get_user_role", {
            _user_id: userId,
          });
          const role = roleData || "user";
          const dest = role === "admin" || role === "moderator" ? "/admin" : "/dashboard";
          navigate(dest);
        } else {
          // Fallback: navigate to dashboard, ProtectedRoute will handle redirect
          navigate("/dashboard");
        }
      } else {
        const msg = result.error || "";
        if (msg.toLowerCase().includes("email not confirmed")) {
          toast({ title: "Email Not Verified", description: "Please check your email and click the verification link before logging in.", variant: "destructive" });
        } else {
          toast({ title: "Error", description: result.error, variant: "destructive" });
        }
      }
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!forgotPasswordEmail.trim()) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }

    setIsSendingReset(true);

    try {
      // Generate password reset link via Supabase
      const { data, error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        // Use built-in auth email delivery (Resend disabled for now)
        toast({
          title: "Email Sent!", 
          description: "Check your email for the password reset link" 
        });
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reset email", variant: "destructive" });
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <header className="p-4 flex justify-between items-center">
        <Link to="/">
          <Logo />
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Login to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Register
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowForgotPassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isSendingReset}>
                {isSendingReset ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Login;
