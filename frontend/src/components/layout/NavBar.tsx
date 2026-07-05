import { Link } from "react-router-dom";

export default function NavBar() {
  return (
    <nav className="flex gap-6 p-4 bg-gray-800 text-white">
      <Link to="/" className="hover:underline">Müşteriler</Link>
      <Link to="/faturalar" className="hover:underline">Faturalar</Link>
      <Link to="/dashboard" className="hover:underline">Dashboard</Link>
    </nav>
  );
}