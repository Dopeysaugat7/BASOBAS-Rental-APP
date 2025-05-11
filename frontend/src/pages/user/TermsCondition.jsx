import { ScrollText, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent dark:from-primary/20 rounded-3xl -z-10" />
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center rounded-lg bg-muted px-4 py-1 text-sm font-medium mx-auto">
            <ScrollText className="h-4 w-4 mr-2 text-primary" />
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
          <div className="space-y-12">
            {/* Introduction */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  Welcome to Basobas! These Terms and Conditions govern your use
                  of our property rental platform. By accessing or using our
                  service, you agree to be bound by these terms.
                </p>
              </CardContent>
            </Card>

            {/* User Responsibilities */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-bold">
                    User Responsibilities
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3 list-disc pl-5">
                  <li>You must be at least 18 years old to use our services</li>
                  <li>
                    Provide accurate and complete information in all forms
                  </li>
                  <li>
                    Do not engage in fraudulent activities or misrepresentations
                  </li>
                  <li>Respect the privacy and rights of other users</li>
                  <li>Comply with all applicable laws and regulations</li>
                </ul>
              </CardContent>
            </Card>

            {/* Property Listings */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-bold">
                    Property Listings
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Property owners are responsible for the accuracy of their
                  listings. We verify all listings but cannot guarantee complete
                  accuracy. Tenants should conduct their own due diligence
                  before renting.
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    Listings must not contain false or misleading information
                  </li>
                  <li>Photos must accurately represent the property</li>
                  <li>Pricing must include all mandatory fees</li>
                  <li>Availability must be kept up-to-date</li>
                </ul>
              </CardContent>
            </Card>

            {/* Payments & Fees */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Payments & Fees
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Our platform facilitates payments between tenants and property
                  owners. All transactions are secure and processed through our
                  trusted payment partners.
                </p>
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">For Tenants</h4>
                    <ul className="space-y-2 text-sm">
                      <li>Security deposit (refundable)</li>
                      <li>First month's rent</li>
                      <li>Service fee (3% of rent)</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4 bg-muted/50">
                    <h4 className="font-semibold mb-2">For Property Owners</h4>
                    <ul className="space-y-2 text-sm">
                      <li>Listing fee (one-time)</li>
                      <li>Success fee (8% of rent)</li>
                      <li>Premium placement (optional)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cancellations & Refunds */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-primary" />
                  <CardTitle className="text-2xl font-bold">
                    Cancellations & Refunds
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  Cancellation policies vary by property and are set by the
                  property owner. Please review the specific cancellation policy
                  before booking.
                </p>
                <ul className="space-y-3 list-disc pl-5">
                  <li>
                    Tenant cancellations may incur fees based on the property's
                    policy
                  </li>
                  <li>
                    Owner cancellations are strongly discouraged and may result
                    in penalties
                  </li>
                  <li>Refunds are processed within 7-10 business days</li>
                </ul>
              </CardContent>
            </Card>

            {/* Dispute Resolution */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Dispute Resolution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  In case of disputes between tenants and property owners, we
                  provide mediation services. Both parties agree to attempt
                  mediation before pursuing other remedies.
                </p>
              </CardContent>
            </Card>

            {/* Changes to Terms */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Changes to Terms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  We may update these Terms periodically. Continued use of our
                  services after changes constitutes acceptance of the new
                  Terms. We will notify users of significant changes.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">Contact Us</CardTitle>
              </CardHeader>
              <CardContent>
                <p>
                  For questions about these Terms, please contact our legal team
                  at
                  <span className="text-primary font-medium">
                    {" "}
                    legal@basobas.com
                  </span>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Acceptance Section */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            By using our platform, you acknowledge that you have read,
            understood, and agree to be bound by these Terms.
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
