import { Lock, Shield, Database, User, Mail, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-3xl -z-10" />
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium mx-auto">
            <Lock className="h-4 w-4 mr-2 text-primary" />
            Your Privacy Matters
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Privacy
            </span>{' '}
            <span style={{ color: '#007FA3' }}>Policy</span>
          </h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Effective:{" "}
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
        <div className="space-y-8">
          {/* Introduction */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                At Basobas, we are committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when 
                you use our property rental platform.
              </p>
            </CardContent>
          </Card>

          {/* Data Collection */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <User className="h-4 w-4" />
                    Personal Information
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Name and contact details</li>
                    <li>• Payment information</li>
                    <li>• Government ID (for verification)</li>
                    <li>• Profile information</li>
                  </ul>
                </div>
                <div className="border rounded-lg p-4 bg-muted/10">
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-sm">
                    <Server className="h-4 w-4" />
                    Usage Data
                  </h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• IP address and device information</li>
                    <li>• Browser type and version</li>
                    <li>• Pages visited and interactions</li>
                    <li>• Search queries and preferences</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Data */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Service Provision",
                    description: "To facilitate property rentals and manage your account",
                  },
                  {
                    title: "Communication",
                    description: "To send booking confirmations and important updates",
                  },
                  {
                    title: "Improvements",
                    description: "To enhance and personalize your experience",
                  },
                  {
                    title: "Security",
                    description: "To detect and prevent fraudulent activities",
                  },
                  {
                    title: "Legal Compliance",
                    description: "To meet regulatory requirements",
                  },
                  {
                    title: "Marketing",
                    description: "To inform you about relevant properties (with consent)",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-muted/10"
                  >
                    <h4 className="font-medium mb-1 text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Data Sharing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                We only share your information in these specific circumstances:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-muted-foreground text-sm">
                <li>
                  <strong>With Property Owners:</strong> Necessary information for completing bookings
                </li>
                <li>
                  <strong>Service Providers:</strong> Payment processors and analytics providers
                </li>
                <li>
                  <strong>Legal Requirements:</strong> When required by law
                </li>
                <li>
                  <strong>Business Transfers:</strong> In connection with any merger
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2 text-sm">Our Protections</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Encryption of sensitive data</li>
                    <li>• Regular security audits</li>
                    <li>• Access controls and monitoring</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm">Your Responsibilities</h4>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li>• Keep your login credentials secure</li>
                    <li>• Use strong, unique passwords</li>
                    <li>• Log out after using shared devices</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    title: "Access",
                    description: "Request a copy of your personal data",
                  },
                  {
                    title: "Correction",
                    description: "Update or correct inaccurate information",
                  },
                  {
                    title: "Deletion",
                    description: "Request deletion of your personal data",
                  },
                  {
                    title: "Opt-Out",
                    description: "Unsubscribe from marketing communications",
                  },
                  {
                    title: "Restriction",
                    description: "Limit how we use your data",
                  },
                  {
                    title: "Portability",
                    description: "Request transfer of your data to another service",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="border rounded-lg p-3 bg-muted/10"
                  >
                    <h4 className="font-medium mb-1 text-sm">{item.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Cookies & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                We use cookies and similar technologies to:
              </p>
              <div className="grid gap-2 grid-cols-2 sm:grid-cols-3">
                {[
                  "Authenticate users",
                  "Remember preferences",
                  "Analyze usage",
                  "Prevent fraud",
                  "Personalize content",
                  "Improve services",
                ].map((item, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 text-primary mr-1 mt-0.5 text-xs">
                      •
                    </div>
                    <span className="text-muted-foreground text-sm">{item}</span>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-4 text-sm">
                You can manage cookie preferences in your browser settings or through our cookie consent tool.
              </p>
            </CardContent>
          </Card>

          {/* Changes & Contact */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Policy Updates & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground text-sm">
                We may update this Privacy Policy periodically. We'll notify you of significant changes through email or prominent notices on our platform.
              </p>
              <p className="text-muted-foreground text-sm">
                For privacy-related inquiries or to exercise your rights:
              </p>
              <div className="bg-muted/10 rounded-lg p-3 inline-block">
                <p className="font-medium text-sm">privacy@basobas.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Acceptance Section */}
        <div className="mt-12 text-center">
          <Link to="/">
            <Button size="lg" className="w-full sm:w-auto">
              Back to Home
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-4">
            By using our services, you acknowledge you have read and understood this Privacy Policy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;