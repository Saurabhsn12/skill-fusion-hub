import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

// Validation schema
const eventSchema = z.object({
  title: z.string()
    .trim()
    .min(5, { message: "Event title must be at least 5 characters" })
    .max(100, { message: "Event title must be less than 100 characters" }),
  description: z.string()
    .trim()
    .min(20, { message: "Description must be at least 20 characters" })
    .max(1000, { message: "Description must be less than 1000 characters" }),
  eventType: z.string()
    .min(1, { message: "Please select an event type" }),
  campus: z.string()
    .min(1, { message: "Please select a campus" }),
  organizerName: z.string()
    .trim()
    .min(2, { message: "Organizer name must be at least 2 characters" })
    .max(100, { message: "Organizer name must be less than 100 characters" }),
  date: z.string()
    .min(1, { message: "Please select a date" }),
  time: z.string()
    .min(1, { message: "Please select a time" }),
  location: z.string()
    .trim()
    .min(3, { message: "Location must be at least 3 characters" })
    .max(200, { message: "Location must be less than 200 characters" }),
  maxParticipants: z.string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Max participants must be a positive number"
    }),
  isPaid: z.string(),
  price: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

const CreateEvent = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      isPaid: "free",
    },
  });

  const isPaid = watch("isPaid");

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validation for paid events
      if (data.isPaid === "paid" && (!data.price || Number(data.price) <= 0)) {
        toast.error("Please enter a valid price for paid events");
        setIsSubmitting(false);
        return;
      }

      // TODO: Submit to backend
      console.log("Event data:", data);
      
      toast.success("Event created successfully!");
      navigate("/events");
    } catch (error) {
      toast.error("Failed to create event. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-3xl">Create New Event</CardTitle>
            <CardDescription>Fill in the details to create your gaming event</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Event Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., BGMI Campus Championship 2024"
                  {...register("title")}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title.message}</p>
                )}
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type *</Label>
                <Select onValueChange={(value) => setValue("eventType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gaming">Gaming</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="esports">E-Sports</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.eventType && (
                  <p className="text-sm text-destructive">{errors.eventType.message}</p>
                )}
              </div>

              {/* Campus Selection */}
              <div className="space-y-2">
                <Label htmlFor="campus">Campus *</Label>
                <Select onValueChange={(value) => setValue("campus", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campus" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="iit-delhi">IIT Delhi</SelectItem>
                    <SelectItem value="iit-bombay">IIT Bombay</SelectItem>
                    <SelectItem value="delhi-university">Delhi University</SelectItem>
                    <SelectItem value="mumbai-university">Mumbai University</SelectItem>
                    <SelectItem value="bangalore-university">Bangalore University</SelectItem>
                    <SelectItem value="public">Public Event (All Campuses)</SelectItem>
                    <SelectItem value="online">Online Event</SelectItem>
                  </SelectContent>
                </Select>
                {errors.campus && (
                  <p className="text-sm text-destructive">{errors.campus.message}</p>
                )}
              </div>

              {/* Organizer Name */}
              <div className="space-y-2">
                <Label htmlFor="organizerName">Organizer Name *</Label>
                <Input
                  id="organizerName"
                  placeholder="e.g., Skill Fusion Gaming Club"
                  {...register("organizerName")}
                />
                {errors.organizerName && (
                  <p className="text-sm text-destructive">{errors.organizerName.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your event, rules, prizes, and other important details..."
                  rows={6}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      {...register("date")}
                    />
                  </div>
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    {...register("time")}
                  />
                  {errors.time && (
                    <p className="text-sm text-destructive">{errors.time.message}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="location"
                    placeholder="e.g., Main Auditorium, Building A"
                    className="pl-10"
                    {...register("location")}
                  />
                </div>
                {errors.location && (
                  <p className="text-sm text-destructive">{errors.location.message}</p>
                )}
              </div>

              {/* Max Participants */}
              <div className="space-y-2">
                <Label htmlFor="maxParticipants">Maximum Participants *</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="maxParticipants"
                    type="number"
                    placeholder="e.g., 100"
                    className="pl-10"
                    {...register("maxParticipants")}
                  />
                </div>
                {errors.maxParticipants && (
                  <p className="text-sm text-destructive">{errors.maxParticipants.message}</p>
                )}
              </div>

              {/* Paid/Free */}
              <div className="space-y-2">
                <Label>Event Type</Label>
                <Select 
                  defaultValue="free"
                  onValueChange={(value) => setValue("isPaid", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free Event</SelectItem>
                    <SelectItem value="paid">Paid Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price (conditional) */}
              {isPaid === "paid" && (
                <div className="space-y-2">
                  <Label htmlFor="price">Entry Fee (₹) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      placeholder="e.g., 299"
                      className="pl-10"
                      {...register("price")}
                    />
                  </div>
                  {errors.price && (
                    <p className="text-sm text-destructive">{errors.price.message}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate("/events")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="hero"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating Event..." : "Create Event"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateEvent;
