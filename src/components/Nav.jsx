import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Home as HomeIcon, LogOut } from "lucide-react";
import SignalBars from "./SignalBars";
import { useAuth } from "../hooks/useAuth";

const ROUTE_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/upload", label: "Insert Image" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/reports", label: "Reports" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors ${isActive ? "text-white" : "text-gray hover:text-white"}`;

  return (
    <header
      className="sticky top-0 z-50 transition-colors"
      style={{
        background: scrolled ? "rgba(0,0,0,0.85)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green shrink-0">
            <HomeIcon size={16} color="#000" strokeWidth={2.5} />
          </div>
          <span className="text-white font-extrabold text-sm tracking-tight">SENTINEL AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {ROUTE_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <span className="flex items-center gap-2 text-[11px] font-semibold text-green">
            <SignalBars size="sm" count={3} />
            Live Monitoring
          </span>
          {isAuthenticated ? (
            <>
              <span className="text-xs text-gray">
                {user.name} <span className="text-grayDim">· {user.role}</span>
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-elevated text-white border border-line hover:bg-cardHover transition-colors"
              >
                <LogOut size={13} /> Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 rounded-full text-xs font-bold bg-green text-black hover:bg-greenBright transition-colors"
            >
              Sign In
            </button>
          )}
        </div>

        <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden px-5 pb-5 flex flex-col gap-1 bg-black/95 border-t border-line">
          {ROUTE_LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `text-left py-2.5 text-sm font-semibold ${isActive ? "text-white" : "text-gray"}`}>
              {l.label}
            </NavLink>
          ))}
          {isAuthenticated ? (
            <>
              <span className="mt-2 text-xs text-gray">
                {user.name} <span className="text-grayDim">· {user.role}</span>
              </span>
              <button onClick={handleLogout} className="mt-2 px-4 py-2.5 rounded-full text-xs font-bold bg-elevated text-white border border-line">
                Logout
              </button>
            </>
          ) : (
            <button onClick={() => navigate("/login")} className="mt-2 px-4 py-2.5 rounded-full text-xs font-bold bg-green text-black">
              Sign In
            </button>
          )}
        </div>
      )}
    </header>
  );
}
