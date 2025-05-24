
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Dashboard from "./components/Dashboard";
import FormBuilder from "./components/FormBuilder";
import FormViewer from "./components/FormViewer";
import FormManagement from "./components/FormManagement";
import Statistics from "./components/Statistics";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 w-full">
          <div className="flex w-full">
            <Navigation />
            <main className="flex-1 ml-64">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/forms/new" element={<FormBuilder />} />
                <Route path="/forms" element={<FormManagement />} />
                <Route path="/forms/:id" element={<FormViewer />} />
                <Route path="/statistics" element={<Statistics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
