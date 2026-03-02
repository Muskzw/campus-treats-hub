import { useCampus } from "@/context/CampusContext";
import { campuses, hostels } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { Navigate, Link } from "react-router-dom";
import { User, MapPin, Settings, LogOut, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const ProfilePage = () => {
  const { isSetup, campusId, hostelId, roomNumber } = useCampus();
  if (!isSetup) return <Navigate to="/setup" replace />;

  const campus = campuses.find((c) => c.id === campusId);
  const hostel = hostels[campusId!]?.find((h) => h.id === hostelId);

  const menuItems = [
    { label: "Edit Delivery Location", icon: MapPin, to: "/setup" },
    { label: "Settings", icon: Settings, to: "#" },
    { label: "Log Out", icon: LogOut, to: "#" },
  ];

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
        <h2 className="font-display font-bold text-lg mt-3">Student</h2>
        <p className="text-xs text-muted-foreground mt-1">
          {campus?.name} · {hostel?.name} · {roomNumber}
        </p>
      </motion.div>

      <div className="mx-4 mt-4 bg-card rounded-2xl border border-border overflow-hidden">
        {menuItems.map((item, i) => (
          <Link
            key={item.label}
            to={item.to}
            className={`flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors ${
              i < menuItems.length - 1 ? "border-b border-border" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
