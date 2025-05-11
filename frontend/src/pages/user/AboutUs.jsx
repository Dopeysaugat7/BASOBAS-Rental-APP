import { Building, Home, ShieldCheck, Users, Globe, Heart } from "lucide-react";
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
        <Skeleton className="h-8 w-24 mx-auto" />
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
        <Skeleton className="h-8 w-24 mx-auto" />
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
        <Skeleton className="h-8 w-24 mx-auto" />
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
        <Skeleton className="h-8 w-24 mx-auto" />
      ) : isError || !stats ? (
        "98%"
      ) : (
        `${stats.satisfactionRate}%`
      ),
      label: "Satisfaction Rate",
    },
  ];

  const teamImage = [
    {
      name: "Rohan Shrestha",
      link: "/Rohan.jpg",
    },
    {
      name: "Saugat Sudarsan Bista",
      link: "/Saugat.jpg",
    },
    {
      name: "Sajjit Bom Malla",
      link: "/Sajjit.jpg",
    },
    {
      name: "Diplov Rawal",
      link: "/Diplov.jpg",
    },
    {
      name: "Bidit Rana",
      link: "/Bidit.jpg",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 rounded-3xl -z-10" />
        <div className="text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70"
          >
            About Our Rental Platform
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            Connecting tenants with their perfect homes and helping property
            owners maximize their investments since 2025.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex justify-center gap-4 pt-6"
          >
            <Button size="lg">
              <Link to="/properties">Browse Properties</Link>
            </Button>
            <Button variant="outline" size="lg">
              <Link to="/dashboard/add-property">List Your Property</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center rounded-lg bg-muted px-4 py-1 text-sm font-medium">
              <Building className="h-4 w-4 mr-2 text-primary" />
              Our Story
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Revolutionizing property rentals
            </h2>
            <p className="text-lg text-muted-foreground">
              Founded in 2025, we set out to create a rental platform that
              prioritizes transparency, ease of use, and trust between property
              owners and tenants. What started as a small local service has
              grown into a trusted platform serving thousands across the
              country.
            </p>
            <p className="text-lg text-muted-foreground">
              Our team of real estate experts and technologists work tirelessly
              to improve the rental experience for everyone involved.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-video w-full rounded-2xl bg-gradient-to-tr from-primary to-secondary overflow-hidden shadow-xl">
              <img
                src="/OurTeam.jpg"
                alt="Our team"
                className="h-full w-full object-contain opacity-90"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-background p-4 rounded-xl shadow-lg border">
              <div className="flex items-center">
                <div className="flex -space-x-2">
                  {teamImage.map(({ name, link }) => (
                    <img
                      src={link}
                      alt={name}
                      className="object-cover h-10 w-10 rounded-full bg-muted border-2 border-background object-fit"
                      key={name}
                    />
                  ))}
                </div>
                <div className="ml-4">
                  <p className="font-medium">Our Team</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-primary/5 dark:bg-primary/10">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statItems.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon className="h-10 w-10 mx-auto text-primary" />
                <h3 className="mt-4 text-3xl font-bold">{stat.value}</h3>
                <p className="mt-2 text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center rounded-lg bg-muted px-4 py-1 text-sm font-medium">
            <ShieldCheck className="h-4 w-4 mr-2 text-primary" />
            Our Values
          </div>
          <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight">
            What makes us different
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              title: "Transparency First",
              description:
                "No hidden fees, no surprises. We believe in complete transparency in pricing and policies.",
              icon: "🔍",
            },
            {
              title: "Verified Listings",
              description:
                "Every property is personally verified by our team to ensure accuracy and quality.",
              icon: "✅",
            },
            {
              title: "Smart Matching",
              description:
                "Our algorithm helps match tenants with properties that fit their needs perfectly.",
              icon: "🤝",
            },
            {
              title: "24/7 Support",
              description:
                "Our customer service team is available around the clock to assist you.",
              icon: "🛎️",
            },
            {
              title: "Secure Payments",
              description:
                "All transactions are protected with bank-level security measures.",
              icon: "🔒",
            },
            {
              title: "Community Focused",
              description:
                "We actively contribute to improving housing standards in our communities.",
              icon: "🏘️",
            },
          ].map((value, i) => (
            <Card
              key={i}
              className="hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader>
                <span className="text-3xl">{value.icon}</span>
                <CardTitle className="mt-4">{value.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{value.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
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
