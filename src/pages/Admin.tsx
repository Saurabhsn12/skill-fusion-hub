import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, PlusCircle, Loader2 } from "lucide-react";
import { seedSampleEvents } from "@/scripts/seedEvents";
import { toast } from "sonner";

const Admin = () => {
  const navigate = useNavigate();
  const [seeding, setSeeding] = useState(false);

  const handleSeedEvents = async () => {
    setSeeding(true);
    try {
      const result = await seedSampleEvents();
      if (result.success) {
        toast.success(`Successfully created ${result.count} sample events for 2026!`);
        setTimeout(() => navigate('/events'), 2000);
      } else {
        toast.error(result.error || "Failed to seed events");
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-foreground mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Manage sample events and database operations
              </p>
              <Button 
                onClick={handleSeedEvents} 
                className="w-full"
                disabled={seeding}
              >
                {seeding ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Events...
                  </>
                ) : (
                  <>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Seed 2026 Events
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Admin;
