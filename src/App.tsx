import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

// Dashboard pages
import Dashboard from "./pages/dashboard/Overview";
import Investments from "./pages/dashboard/Investments";
import Trading from "./pages/dashboard/Trading";
import Wallet from "./pages/dashboard/Wallet";
import Transactions from "./pages/dashboard/Transactions";
import Profile from "./pages/dashboard/Profile";
import Settings from "./pages/dashboard/Settings";

// Admin pages
import AdminOverview from "./pages/admin/Overview";
import UserManagement from "./pages/admin/UserManagement";
import AdminTransactions from "./pages/admin/Transactions";
import AdminInvestments from "./pages/admin/Investments";
import AdminSecurity from "./pages/admin/Security";
import AdminSettings from "./pages/admin/Settings";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const msg = String(error?.message || "").toLowerCase();
        if (msg.includes("not authenticated") || msg.includes("jwt") || msg.includes("invalid")) {
          return false;
        }
        return failureCount < 2;
      },
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* User dashboard routes */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><Dashboard /></ProtectedRoute>} />
              <Route path="/dashboard/investments" element={<ProtectedRoute allowedRoles={["user"]}><Investments /></ProtectedRoute>} />
              <Route path="/dashboard/trading" element={<ProtectedRoute allowedRoles={["user"]}><Trading /></ProtectedRoute>} />
              <Route path="/dashboard/wallet" element={<ProtectedRoute allowedRoles={["user"]}><Wallet /></ProtectedRoute>} />
              <Route path="/dashboard/transactions" element={<ProtectedRoute allowedRoles={["user"]}><Transactions /></ProtectedRoute>} />
              <Route path="/dashboard/profile" element={<ProtectedRoute allowedRoles={["user"]}><Profile /></ProtectedRoute>} />
              <Route path="/dashboard/settings" element={<ProtectedRoute allowedRoles={["user"]}><Settings /></ProtectedRoute>} />

              {/* Admin/Moderator dashboard routes */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><AdminOverview /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><UserManagement /></ProtectedRoute>} />
              <Route path="/admin/transactions" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/investments" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><AdminInvestments /></ProtectedRoute>} />
              <Route path="/admin/security" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><AdminSecurity /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["admin", "moderator"]}><AdminSettings /></ProtectedRoute>} />

              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
