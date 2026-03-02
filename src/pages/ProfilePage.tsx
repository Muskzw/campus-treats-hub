import { useCampus } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import { campuses, hostels } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { Navigate, Link, useNavigate } from "react-router-dom";
import { User, MapPin, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { isSetup, campusId, hostelId, roomNumber, loading } = useCampus();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSetup) return <Navigate to="/setup" replace />;

  const campus = campuses.find((c) => c.id === campusId);
  const hostel = hostels[campusId!]?.find((h) => h.id === hostelId);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">Profile</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 bg-card rounded-2xl p-5 border border-border text-center"
      >
        <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center mx-auto">
          <User className="w-8 h-8 text-accent-foreground" />
        </div>
        <h2 className="font-display font-bold text-lg mt-3">
          {user?.user_metadata?.full_name || "Student"}
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {campus?.name} · {hostel?.name} · {roomNumber}
        </p>
      </motion.div>

      <div className="mx-4 mt-4 bg-card rounded-2xl border border-border overflow-hidden">
        <Link
          to="/setup"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Edit Delivery Location</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
