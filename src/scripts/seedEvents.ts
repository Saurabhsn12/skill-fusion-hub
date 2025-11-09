import { supabase } from "@/integrations/supabase/client";

export const seedSampleEvents = async () => {
  const sampleEvents = [
    {
      title: "Campus Coding Challenge 2026",
      description: "Ultimate programming competition featuring algorithmic challenges, hackathon rounds, and live coding battles. Win amazing prizes and internship opportunities!",
      event_type: "Tech Event",
      event_date: "2026-03-15",
      event_time: "10:00:00",
      location: "IIT Delhi Campus",
      campus: "IIT Delhi",
      max_participants: 200,
      is_paid: true,
      price: 500,
      is_promoted: true,
      organizer_name: "IIT Tech Club",
      ad_image_url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
    },
    {
      title: "BGMI Battleground Masters 2026",
      description: "Intense BGMI tournament with squad battles, elimination rounds, and ultimate showdown. Top teams compete for massive prize pool!",
      event_type: "BGMI",
      event_date: "2026-04-20",
      event_time: "14:00:00",
      location: "Online",
      campus: "Online Event",
      max_participants: 100,
      is_paid: true,
      price: 300,
      is_promoted: true,
      organizer_name: "Skill Fusion Esports",
      ad_image_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&q=80"
    },
    {
      title: "Inter-University Hackathon 2026",
      description: "48-hour innovation marathon bringing together brightest minds to solve real-world problems. Build, pitch, and win!",
      event_type: "Tech Event",
      event_date: "2026-06-10",
      event_time: "09:00:00",
      location: "Multiple Campuses",
      campus: "Delhi University",
      max_participants: 500,
      is_paid: false,
      price: null,
      is_promoted: true,
      organizer_name: "Tech United",
      ad_image_url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80"
    },
    {
      title: "Skill Fusion Sports Meet 2026",
      description: "Multi-sport extravaganza featuring cricket, football, basketball, and more. Compete, connect, and celebrate sportsmanship!",
      event_type: "Sports",
      event_date: "2026-08-05",
      event_time: "07:00:00",
      location: "Mumbai Sports Complex",
      campus: "Mumbai University",
      max_participants: 1000,
      is_paid: true,
      price: 200,
      is_promoted: false,
      organizer_name: "Sports Committee",
      ad_image_url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&q=80"
    },
    {
      title: "Chess League 2026",
      description: "Strategic warfare on the chessboard. From beginners to grandmasters, prove your tactical supremacy in this classic game!",
      event_type: "Strategy",
      event_date: "2026-09-12",
      event_time: "11:00:00",
      location: "Bangalore Chess Club",
      campus: "Bangalore University",
      max_participants: 64,
      is_paid: true,
      price: 150,
      is_promoted: false,
      organizer_name: "Chess Masters Association",
      ad_image_url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=800&q=80"
    },
    {
      title: "E-Sports Grand Arena 2026",
      description: "Multi-game championship featuring Valorant, Free Fire, COD Mobile, and more. Ultimate battle for gaming supremacy!",
      event_type: "Multi-Game",
      event_date: "2026-11-18",
      event_time: "13:00:00",
      location: "Online",
      campus: "Online Event",
      max_participants: 300,
      is_paid: true,
      price: 400,
      is_promoted: true,
      organizer_name: "Skill Fusion Pro",
      ad_image_url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&q=80"
    },
    {
      title: "Fusion Fest 2026",
      description: "The ultimate cultural and music festival! Three days of performances, competitions, food, and non-stop entertainment!",
      event_type: "Cultural",
      event_date: "2026-12-20",
      event_time: "16:00:00",
      location: "Central Park Grounds",
      campus: "Public Event",
      max_participants: 5000,
      is_paid: true,
      price: 800,
      is_promoted: true,
      organizer_name: "Fusion Fest Committee",
      ad_image_url: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80"
    }
  ];

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error("Must be logged in to seed events");
    }

    // Verify admin role
    const { data: isAdmin, error: roleError } = await supabase.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    if (roleError || !isAdmin) {
      throw new Error("Admin privileges required to seed events");
    }

    const eventsWithCreator = sampleEvents.map(event => ({
      ...event,
      created_by: user.id
    }));

    const { data, error } = await supabase
      .from('events')
      .insert(eventsWithCreator)
      .select();

    if (error) throw error;

    console.log(`Successfully created ${data?.length} sample events for 2026!`);
    return { success: true, count: data?.length };
  } catch (error: any) {
    console.error('Error seeding events:', error);
    return { success: false, error: error.message };
  }
};
