import {
  Building,
  Home,
  ShieldCheck,
  Users,
  Globe,
  Heart,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import { Link } from "react-router-dom";

// Team member data
const teamMembers = [
  { name: "Rohan Shrestha", image: "/Rohan.jpg", role: "Developer" },
  { name: "Saugat Sudarsan Bista", image: "/Saugat.jpg", role: "Developer" },
  { name: "Sajjit Bom Malla", image: "/Sajjit.jpg", role: "Business Analyst" },
  { name: "Diplov Rawal", image: "/Diplov.jpg", role: "Project Manager" },
  { name: "Bidit Rana", image: "/Bidit.jpg", role: "Developer" },
];

// Values data
const coreValues = [
  {
    title: "Transparency First",
    description:
      "No hidden fees, no surprises. Complete transparency in pricing and policies.",
    icon: "🔍",
  },
  {
    title: "Verified Listings",
    description:
      "Every property personally verified to ensure accuracy and quality.",
    icon: "✅",
  },
  {
    title: "Easy Search Filters",
    description:
      "Find properties quickly with location, budget, and amenities-based filters.",
    icon: "🔎",
  },
  {
    title: "24/7 Support",
    description: "Dedicated customer service available around the clock.",
    icon: "🛎️",
  },
  {
    title: "Secure Payments",
    description: "Bank-level security for all transactions.",
    icon: "🔒",
  },
  {
    title: "Community Focused",
    description: "Actively improving housing standards in our communities.",
    icon: "🏘️",
  },
];

const fetchPlatformStats = async () => {
  const response = await axios.get(
    "http://localhost:5000/api/properties/platform-stats",
    { withCredentials: true }
  );
  return response.data.stats;
};

const AboutUs = () => {
  const {
    data: stats,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["platformStats"],
    queryFn: fetchPlatformStats,
  });

  const statItems = [
    {
      icon: Home,
      value: isLoading ? (
        <Skeleton className="h-8 w-24 mx-auto rounded-full" />
      ) : isError || !stats ? (
        "N/A"
      ) : (
        `${stats.totalProperties.toLocaleString()}+`
      ),
      label: "Properties Listed",
    },
    {
      icon: Users,
      value: isLoading ? (
        <Skeleton className="h-8 w-24 mx-auto rounded-full" />
      ) : isError || !stats ? (
        "N/A"
      ) : (
        `${stats.happyTenants.toLocaleString()}+`
      ),
      label: "Happy Tenants",
    },
    {
      icon: Globe,
      value: isLoading ? (
        <Skeleton className="h-8 w-24 mx-auto rounded-full" />
      ) : isError || !stats ? (
        "N/A"
      ) : (
        `${stats.citiesCovered.toLocaleString()}+`
      ),
      label: "Cities Covered",
    },
    {
      icon: Heart,
      value: isLoading ? (
        <Skeleton className="h-8 w-24 mx-auto rounded-full" />
      ) : isError || !stats ? (
        "98%"
      ) : (
        `${stats.satisfactionRate}%`
      ),
      label: "Satisfaction Rate",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-3xl -z-10" />
        <motion.div
          className="text-center space-y-6 relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center gap-2 bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">
              Modern Property Solutions
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Redefining Rental Experiences
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Where technology meets real estate to create seamless connections
            between tenants and property owners.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
            <Button size="lg" className="group" asChild>
              <Link to="/properties" className="flex items-center gap-2">
                Browse Properties
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="group" asChild>
              <Link
                to="/dashboard/add-property"
                className="flex items-center gap-2"
              >
                List Your Property
                <span className="group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center rounded-full bg-muted px-4 py-1 text-sm font-medium w-fit">
              <Building className="h-4 w-4 mr-2 text-primary" />
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Innovating the rental landscape since 2025
            </h2>
            <p className="text-lg text-muted-foreground">
              Born from a vision to simplify property rentals, we've grown into
              Nepal's most trusted platform, leveraging cutting-edge technology
              to connect thousands of tenants with their ideal homes.
            </p>
            <p className="text-lg text-muted-foreground">
              Our team combines real estate expertise with tech innovation to
              deliver an unmatched rental experience.
            </p>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className="aspect-video w-full rounded-3xl bg-gradient-to-tr from-primary to-secondary overflow-hidden shadow-2xl">
              <img
                src="/OurTeam.jpg"
                alt="Our team"
                className="h-full w-full object-cover opacity-90"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-2xl shadow-xl border dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {teamMembers.slice(0, 5).map((member) => (
                    <motion.img
                      key={member.name}
                      src={member.image}
                      alt={member.name}
                      className="h-10 w-10 rounded-full bg-muted border-2 border-background object-cover"
                      whileHover={{ scale: 1.1, zIndex: 10 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                  ))}
                </div>
                <div className="ml-4">
                  <p className="font-medium">Our Team</p>
                  <p className="text-sm text-muted-foreground">5+ Experts</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent dark:from-primary/10 dark:to-transparent">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
            viewport={{ once: true }}
          >
            {statItems.map((stat, i) => (
              <motion.div
                key={i}
                className="bg-background p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow border dark:border-gray-800"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 rounded-full bg-primary/10 dark:bg-primary/20 mb-4">
                    <stat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center rounded-full bg-muted px-4 py-1 text-sm font-medium mb-4">
            <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
            Our Values
          </div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            The foundation of everything we do
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Core principles that guide our platform and service
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreValues.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-all duration-300 group border dark:border-gray-800">
                <CardHeader>
                  <span className="text-3xl mb-2">{value.icon}</span>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {value.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{value.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900/50 dark:to-gray-900">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Meet Our Leadership
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The passionate team driving innovation in property rentals
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {teamMembers.map((member, i) => (
              <motion.div
                key={member.name}
                className="flex flex-col items-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="relative mb-4 group">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-40 w-40 rounded-2xl object-cover shadow-md group-hover:shadow-lg transition-all"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <span className="text-white font-medium">
                      {member.role}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold">{member.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-[90vw] mx-auto mb-10 md:mb-15 rounded-lg overflow-hidden">
        {/* Background with overlay */}
        <div className="absolute inset-0 z-10">
          <img
            src="https://images.unsplash.com/photo-1617730783031-0effdfa3427c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Nepali traditional house"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative max-w-3xl mx-auto text-center z-20"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            Ready to Find Your Dream Property?
          </h2>
          <p className="text-sm md:text-base lg:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect home
            with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-md transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Link to="/properties">Browse Properties</Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/30 px-6 py-3 md:px-8 md:py-4 text-sm md:text-base rounded-md transition-all duration-300"
            >
              <Link to="/dashboard/add-property">List Your Property</Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutUs;
