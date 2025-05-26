
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import AuthPage from "@/components/AuthPage";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import FormManagement from "@/components/FormManagement";
import FormBuilder from "@/components/FormBuilder";
import FormEditor from "@/components/FormEditor";
import FormViewer from "@/components/FormViewer";
import ResponseViewer from "@/components/ResponseViewer";
import Statistics from "@/components/Statistics";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              {/* Public routes */}
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/forms/:id" element={<FormViewer />} />
              
              {/* Protected routes with navigation */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <div className="min-h-screen">
                      <Navigation />
                      <main className="pt-16">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/forms" element={<FormManagement />} />
                          <Route path="/forms/new" element={<FormBuilder />} />
                          <Route path="/forms/:id/edit" element={<FormEditor />} />
                          <Route path="/responses/:id" element={<ResponseViewer />} />
                          <Route path="/statistics/:id" element={<Statistics />} />
                        </Routes>
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
