import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { UsernamePrompt } from "@/components/UsernamePrompt";
import Footer from "@/components/Footer";

const Index = lazy(() => import("./pages/Index"));
const Events = lazy(() => import("./pages/Events"));
const Profile = lazy(() => import("./pages/Profile"));
const CreateEvent = lazy(() => import("./pages/CreateEvent"));
const EventDetail = lazy(() => import("./pages/EventDetail"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Friends = lazy(() => import("./pages/Friends"));
const Teams = lazy(() => import("./pages/Teams"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UsernamePrompt />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/events" element={<Events />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/create-event" element={<CreateEvent />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
