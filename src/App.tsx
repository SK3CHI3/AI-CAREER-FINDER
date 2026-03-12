import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import PaymentGate from "@/components/PaymentGate";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolDashboard from "./pages/SchoolDashboard"
import SchoolTeachers from "./pages/SchoolTeachers"
import SchoolClasses from "./pages/SchoolClasses"
import TeacherDashboard from "./pages/TeacherDashboard"
import ClassDetail from "./pages/ClassDetail";
import AcceptInvite from "./pages/AcceptInvite";
import Dashboard from "./pages/Dashboard";
import SchoolInsightsPage from "./pages/SchoolInsightsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/student"
              element={
                <ProtectedRoute requiredRole="student">
                  <PaymentGate>
                    <StudentDashboard />
                  </PaymentGate>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/school"
              element={
                <ProtectedRoute requiredRole="school">
                  <SchoolDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/school/teachers"
              element={
                <ProtectedRoute requiredRole="school">
                  <SchoolTeachers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/school/classes"
              element={
                <ProtectedRoute requiredRole="school">
                  <SchoolClasses />
                </ProtectedRoute>
              }
            />
            <Route
              path="/school/insights"
              element={
                <ProtectedRoute requiredRole="school">
                  <SchoolInsightsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teacher/class/:classId"
              element={
                <ProtectedRoute requiredRole="teacher">
                  <ClassDetail />
                </ProtectedRoute>
              }
            />
            <Route path="/invite" element={<AcceptInvite />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
