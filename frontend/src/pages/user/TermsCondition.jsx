import {
  ScrollText,
  ShieldCheck,
  FileText,
  AlertCircle,
  Home,
  Wallet,
  Handshake,
  Mail,
  CalendarCheck,
  BadgeCheck,
  CircleDollarSign,
  RefreshCw,
  Scale,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-3xl -z-10" />
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium mx-auto">
            <ScrollText className="h-4 w-4 mr-2 text-primary" />
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Terms
            </span>{" "}
            <span style={{ color: "#007FA3" }}>& Conditions</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Last updated:{" "}
            {new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Introduction */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Welcome to Basobas! These Terms govern your use of our property
                rental platform. By accessing our service, you agree to be bound
                by these terms.
              </p>
            </CardContent>
          </Card>

          {/* User Responsibilities */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <BadgeCheck className="h-5 w-5 text-primary" />
                User Responsibilities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Must be at least 18 years old</li>
                <li>Provide accurate and complete information</li>
                <li>No fraudulent activities or misrepresentations</li>
                <li>Respect other users' privacy and rights</li>
                <li>Comply with all applicable laws</li>
              </ul>
            </CardContent>
          </Card>

          {/* Property Listings */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                Property Listings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Owners are responsible for listing accuracy. Tenants should
                conduct due diligence.
              </p>
              <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>No false or misleading information</li>
                <li>Photos must represent the property accurately</li>
                <li>Pricing must include all mandatory fees</li>
                <li>Availability must be current</li>
              </ul>
            </CardContent>
          </Card>

          {/* Payments & Fees */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <CircleDollarSign className="h-5 w-5 text-primary" />
                Payments & Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Secure payments processed through trusted partners.
              </p>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="border rounded-lg p-3 bg-muted/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wallet className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">For Tenants</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Security deposit (refundable)</li>
                    <li>• First month's rent</li>
                    <li>• Service fee (NPR 120)</li>
                    <li>• Cleaning fee (NPR 75)</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-3 bg-muted/10">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Wallet className="h-4 w-4 text-primary" />
                    <h4 className="font-medium text-sm">For Owners</h4>
                  </div>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Platform service charges may apply</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cancellations & Refunds */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-primary" />
                Cancellations & Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Policies vary by property. Review before booking.
              </p>
              <ul className="space-y-2 list-disc pl-5 text-sm text-muted-foreground">
                <li>Tenant cancellations may incur fees</li>
                <li>Owner cancellations may result in penalties</li>
                <li>Refunds processed in 7-10 business days</li>
              </ul>
            </CardContent>
          </Card>

          {/* Dispute Resolution */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                Dispute Resolution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                We provide mediation services. Both parties agree to attempt
                mediation first.
              </p>
            </CardContent>
          </Card>

          {/* Changes to Terms */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <CalendarCheck className="h-5 w-5 text-primary" />
                Changes to Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                We may update these Terms periodically. Continued use
                constitutes acceptance.
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Questions? Email our legal team at{" "}
                <Link
                  to="mailto:legal@basobas.com"
                  className="text-primary hover:underline"
                >
                  legal@basobas.com
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance Section */}
        <div className="mt-12 text-center">
          <p className="text-xs text-muted-foreground mb-4">
            By using our platform, you agree to these Terms.
          </p>
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default TermsAndConditions;
