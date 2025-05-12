import {
  Mail,
  MapPin,
  Phone,
  Facebook,
  Instagram,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const Category = [
    {
      name: "House",
      link: `/properties?type=House`,
    },
    {
      name: "Apartments",
      link: `/properties?type=Apartment`,
    },
    {
      name: "Penthouse",
      link: `/properties?type=Penthouse`,
    },
    {
      name: "Villa",
      link: `/properties?type=Villa`,
    },
    {
      name: "Duplex",
      link: `/properties?type=Duplex`,
    },
  ];
  return (
    <footer className="w-full border-t border-border bg-card text-card-foreground app-footer">
      <div className="w-full py-8 sm:py-4">
        {/* Main footer content */}
        <div className=" max-w-[100vw] mx-auto">
          <div className="grid grid-cols-1 gap-8 sm:gap-10 sm:grid-cols-2 lg:grid-cols-4 px-6 sm:px-8 lg:px-12 pt-8">
            {/* Logo and company description */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center">
                {/* Logo placeholder */}
                <div className="relative flex h-15 w-18 overflow-hidden rounded object-contain">
                  <img src="/logo.png" alt="Logo" />
                </div>
                <span className="text-4xl font-bold text-primary">Basobas</span>
              </div>
              <p className="text-sm text-card-foreground/70 max-w-xs pl-3">
                Find your perfect home away from home with our curated selection
                of premium rental properties.
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col space-y-4 ">
              <h3 className="text-lg font-semibold">Categories</h3>
              <nav className="flex flex-col space-y-2">
                {Category.map(({ name, link }) => (
                  <Link
                    key={name}
                    to={link}
                    className="text-sm text-card-foreground/70 transition-colors hover:text-primary inline-block"
                    onClick={() => (window.location.href = link)}
                  >
                    {name}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Contact Info */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">Contact</h3>
              <div className="space-y-2 text-sm text-card-foreground/70">
                {[
                  { icon: Phone, text: "+977-9869984916" },
                  { icon: Mail, text: "contact@homerental.com" },
                  { icon: MapPin, text: "Bhagwati bahal-Naxal, Kathmandu, Nepal" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <item.icon className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div className="flex flex-col space-y-4">
              <h3 className="text-lg font-semibold">Company</h3>
              <nav className="flex flex-col space-y-2">
                {[
                  { name: "About us", path: "/about" },
                  { name: "Terms & Conditions", path: "/terms" },
                  { name: "Privacy Policy", path: "/privacy" },
                  { name: "Cookie Policy", path: "/cookies" },
                ].map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="text-sm text-card-foreground/70 transition-colors hover:text-primary inline-block"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom section with copyright and social */}
          <div className="mt-8 pt-6 border-t border-border/30 px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <p className="text-center text-sm text-card-foreground/70 order-2 sm:order-1">
                © {currentYear} Basobas. All rights reserved.
              </p>

              {/* Social Icons */}
              <div className="flex items-center space-x-4 order-1 sm:order-2">
                {[
                  { icon: Facebook, label: "Facebook" },
                  { icon: Instagram, label: "Instagram" },
                  { icon: Twitter, label: "Twitter" },
                ].map((social, index) => (
                  <Link
                    key={index}
                    to="#"
                    className="text-card-foreground/70 transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                    aria-label={social.label}
                  >
                    <social.icon className="h-5 w-5" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
