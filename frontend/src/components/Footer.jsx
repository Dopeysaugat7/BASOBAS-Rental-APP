import {
  Heart,
  HelpCircle,
  Shield,
  Calendar,
  Users,
  BookOpen,
  MessageSquare,
  Gift,
  Home,
  FileText,
} from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#0f172b] text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Support Column */}
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">Support</h3>
            <ul className="space-y-3">
              <FooterItem icon={<HelpCircle size={16} />} text="Help Center" />
              <FooterItem
                icon={<Shield size={16} />}
                text="Safety information"
              />
              <FooterItem
                icon={<Calendar size={16} />}
                text="Cancellation options"
              />
              <FooterItem icon={<Heart size={16} />} text="COVID-19 response" />
            </ul>
          </div>

          {/* Community Column */}
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">
              Community
            </h3>
            <ul className="space-y-3">
              <FooterItem icon={<BookOpen size={16} />} text="Blog" />
              <FooterItem icon={<MessageSquare size={16} />} text="Forum" />
              <FooterItem icon={<Users size={16} />} text="Events" />
              <FooterItem icon={<Gift size={16} />} text="Referrals" />
            </ul>
          </div>

          {/* Hosting Column */}
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">Hosting</h3>
            <ul className="space-y-3">
              <FooterItem icon={<Home size={16} />} text="Try hosting" />
              <FooterItem icon={<FileText size={16} />} text="Resources" />
              <FooterItem
                icon={<MessageSquare size={16} />}
                text="Community forum"
              />
              <FooterItem icon={<Shield size={16} />} text="Host protection" />
            </ul>
          </div>

          {/* About Column */}
          <div>
            <h3 className="font-bold text-lg mb-4 dark:text-white">About</h3>
            <ul className="space-y-3">
              <FooterItem text="Company" />
              <FooterItem text="Careers" />
              <FooterItem text="Press" />
              <FooterItem text="Policies" />
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm mb-4 md:mb-0">
            © 2025 Basobas, Inc. All rights reserved
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:underline">
              Terms
            </a>
            <a href="#" className="hover:underline">
              Privacy
            </a>
            <a href="#" className="hover:underline">
              Sitemap
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const FooterItem = ({ icon, text }) => (
  <li className="flex items-center space-x-2 hover:text-gray-900 dark:hover:text-white cursor-pointer">
    {icon && <span className="text-gray-500 dark:text-gray-400">{icon}</span>}
    <span>{text}</span>
  </li>
);

export default Footer;
