
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AppShellProvider } from "@/contexts/AppShellContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AppLayout from "@/components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppShellProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/concierge" element={<AppLayout />} />
              <Route path="/recipes" element={<AppLayout />} />
              <Route path="/grocery" element={<AppLayout />} />
              <Route path="/kitchen" element={<AppLayout />} />
              <Route path="/music" element={<AppLayout />} />
              <Route path="/artists" element={<AppLayout />} />
              <Route path="/deals" element={<AppLayout />} />
              <Route path="/brands" element={<AppLayout />} />
              <Route path="/profile" element={<AppLayout />} />
              <Route path="/subscription" element={<AppLayout />} />
              <Route path="/admin" element={<AppLayout />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppShellProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
