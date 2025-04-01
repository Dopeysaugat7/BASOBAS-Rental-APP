import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
// import { loadStripe } from "@stripe/stripe-js";
// import { Elements, PaymentElement } from "@stripe/stripe-react";

// Initialize Stripe (you'll need to set up your publishable key)
//   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const Billing = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 7);

  const paymentHistory = [
    { id: 1, date: "2023-10-15", amount: 1200, status: "Paid" },
    { id: 2, date: "2023-09-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
    { id: 3, date: "2023-08-15", amount: 1200, status: "Paid" },
  ];

  // const handleSubmit = async (event) => {
  //   event.preventDefault();
  //   // Handle payment submission with Stripe
  // };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Payment Summary */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Current Payment</CardTitle>
              <CardDescription>Your rent for November 2023</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rent Amount</span>
                  <span className="font-medium">$1,200.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Utilities</span>
                  <span className="font-medium">$85.50</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late Fee</span>
                  <span className="font-medium">$0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Due</span>
                  <span>$1,285.50</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button className="w-full sm:w-auto">Pay Now</Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Download Invoice
              </Button>
            </CardFooter>
          </Card>

          {/* Stripe Payment Method */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Secure payment via Stripe</CardDescription>
            </CardHeader>
            <CardContent>
              {/* <Elements stripe={stripePromise}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <CreditCard className="h-6 w-6 text-primary" />
                      <span>Secure Stripe Payment</span>
                    </div>
                  </div>

                  <PaymentElement
                    options={{
                      layout: "tabs",
                    }}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="submit">Pay $1,285.50</Button>
                  </div>
                </form>
              </Elements> */}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment History and Due Date */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment Due</CardTitle>
              <CardDescription>Next payment deadline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-4xl font-bold">7</div>
                <div className="text-muted-foreground">days remaining</div>
                <Progress value={70} className="h-2" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dueDate && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {dueDate ? (
                        format(dueDate, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dueDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentHistory.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{payment.date}</div>
                    <div className="text-sm text-muted-foreground">
                      Rent payment
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">${payment.amount}</div>
                    <Badge variant="outline">{payment.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="ghost" className="w-full">
                    View All Payments
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto dark:bg-[#0f172b]">
                  <DialogHeader>
                    <DialogTitle>Payment History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {paymentHistory.map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{payment.date}</div>
                          <div className="text-sm text-muted-foreground">
                            Rent payment
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">${payment.amount}</div>
                          <Badge variant="outline">{payment.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
