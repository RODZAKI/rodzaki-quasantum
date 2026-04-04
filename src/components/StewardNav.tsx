import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const links = [
  { href: "/proposals", label: "Proposals" },
  { href: "/supersede", label: "Supersede" },
  { href: "/classify", label: "Classify" },
  { href: "/fields", label: "Fields" },
];

export default function StewardNav() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <div className="w-full border-b px-4 py-2 text-sm bg-muted">
      <div className="mx-auto flex max-w-7xl gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            to={link.href}
            className={`hover:underline ${
              location.hash.includes(link.href)
                ? "font-semibold"
                : "text-muted-foreground"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}