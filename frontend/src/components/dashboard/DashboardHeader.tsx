import {
  CalendarClock,
  CircleCheck,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardHeader() {
  const [currentDateTime, setCurrentDateTime] =
    useState(new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  const formattedDateTime =
    currentDateTime.toLocaleString("en-GB", {
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

          <span>PiaCell Admin Intelligence</span>
        </div>

        <h1 className="dashboard-title">
          System Overview
        </h1>

        <p className="dashboard-subtitle">
          Monitor customers, mobile lines, invoices,
          payments and smart analytics across the PiaCell
          platform.
        </p>
      </div>

      <div className="dashboard-period">
        <ShieldCheck size={18} />

        <div>
          <span>System Admin</span>
          <strong>Secure Access</strong>
        </div>

        <CalendarClock size={18} />

        <div>
          <span>Current Date &amp; Time</span>
          <strong>{formattedDateTime}</strong>
        </div>
      </div>
    </header>
  );
}