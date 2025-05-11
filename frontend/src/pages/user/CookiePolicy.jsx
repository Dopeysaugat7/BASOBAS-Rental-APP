import { Lock, Shield, Server, Database, Mail, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent dark:from-primary/10 rounded-3xl -z-10" />
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-sm font-medium mx-auto">
            <Lock className="h-4 w-4 mr-2 text-primary" />
            Your Cookies
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
              Cookie
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
          {/* What Are Cookies */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                What Are Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                Cookies are small text files placed on your device when you visit websites. 
                They help sites work efficiently and provide information to site owners.
              </p>
            </CardContent>
          </Card>

          {/* How We Use Cookies */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" />
                How We Use Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                Our application uses cookies for:
              </p>
              <ul className="space-y-2 list-disc pl-5 text-muted-foreground text-sm">
                <li>
                  <strong>Essential:</strong> Authentication and security functions
                </li>
                <li>
                  <strong>Performance:</strong> Understanding visitor interactions
                </li>
                <li>
                  <strong>Functionality:</strong> Remembering your preferences
                </li>
              </ul>
              <p className="text-muted-foreground mt-3 text-sm">
                We don't use cookies to collect personally identifiable information without consent.
              </p>
            </CardContent>
          </Card>

          {/* Types of Cookies We Use */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                Types of Cookies We Use
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-muted rounded-lg">
                  <thead className="bg-muted/10">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Cookie
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Purpose
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Duration
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-muted/10">
                    <tr>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        session_id
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Maintain login state
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Session
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        user_prefs
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Store preferences
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        30 days
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        _ga
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        Analytics
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        2 years
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Managing Cookies */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Managing Cookies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-3 text-sm">
                You can control cookies through your browser settings:
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    browser: "Chrome",
                    path: "Settings → Privacy → Cookies"
                  },
                  {
                    browser: "Firefox",
                    path: "Options → Privacy → Cookies"
                  },
                  {
                    browser: "Safari",
                    path: "Preferences → Privacy → Cookies"
                  },
                  {
                    browser: "Edge",
                    path: "Settings → Cookies"
                  }
                ].map((item, index) => (
                  <div key={index} className="border rounded-lg p-3 bg-muted/10">
                    <h4 className="font-medium mb-1 text-sm">{item.browser}</h4>
                    <p className="text-xs text-muted-foreground">{item.path}</p>
                  </div>
                ))}
              </div>
              <p className="text-muted-foreground mt-3 text-sm">
                Disabling cookies may affect application functionality.
              </p>
            </CardContent>
          </Card>

          {/* Changes to This Policy */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Policy Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm">
                We may update this policy periodically. Check this page for changes.
              </p>
            </CardContent>
          </Card>

          {/* Contact Us */}
          <Card className="border-none shadow-sm bg-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-3">
                Questions about our cookie usage?
              </p>
              <div className="bg-muted/10 rounded-lg p-3 inline-block">
                <Link
                  to="mailto:privacy@basobas.com"
                  className="font-medium text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  privacy@basobas.com
                </Link>
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
            By using our services, you acknowledge this Cookie Policy.
          </p>
        </div>
      </section>
    </div>
  );
};

export default CookiePolicy;