import { CalendarClock, CircleCheck } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formattedDateTime = currentDateTime.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  return (
    <header className="dashboard-header">
      <div>
        <div className="dashboard-header-eyebrow">
          <CircleCheck size={14} />
          <span>Operations Overview</span>
        </div>

        <h1 className="dashboard-title">Dashboard</h1>

        <p className="dashboard-subtitle">
         
        </p>
      </div>

      <div className="dashboard-period">
        <CalendarClock size={18} />

        <div>
          <span>Current Date & Time</span>
          <strong>{formattedDateTime}</strong>
        </div>
      </div>
    </header>
  );
}