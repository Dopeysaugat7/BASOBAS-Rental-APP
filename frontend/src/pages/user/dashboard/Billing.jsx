/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
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
import {
  format,
  startOfMonth,
  endOfMonth,
  addMonths,
  differenceInMonths,
  isWithinInterval,
  isAfter,
  isBefore,
  addDays,
  parseISO,
} from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Billing = () => {
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [totalDue, setTotalDue] = useState(0);
  const [dueDate, setDueDate] = useState(null);
  const [progress, setProgress] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const currentDate = new Date();
  const currentMonthStart = startOfMonth(currentDate);
  const currentMonthStr = format(currentDate, "yyyy-MM");
  const nextMonthStart = startOfMonth(addMonths(currentDate, 1));
  const nextMonthStr = format(nextMonthStart, "yyyy-MM");
  const calculatedDueDate = new Date(
    nextMonthStart.getFullYear(),
    nextMonthStart.getMonth(),
    7
  );

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [bookingsRes, paymentsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/bookings/my-bookings", {
          withCredentials: true,
        }),
        axios.get("http://localhost:5000/api/payments/my-payments", {
          withCredentials: true,
        }),
      ]);

      const fetchedBookings = bookingsRes.data?.data || [];
      const fetchedPayments = paymentsRes.data?.data || [];

      const activeBookings = fetchedBookings.filter((booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        return (
          booking.status === "confirmed" &&
          currentDate >= start &&
          currentDate <= end
        );
      });

      let total = 0;
      const bookingsWithRent = await Promise.all(
        activeBookings.map(async (booking) => {
          const months =
            differenceInMonths(
              new Date(booking.endDate),
              new Date(booking.startDate)
            ) || 1;
          const oneTimeFees = 195 + (booking.securityDeposit || 0);
          const monthlyRent = (booking.totalAmount - oneTimeFees) / months;

          const bookingPayments = fetchedPayments.filter(
            (p) => p.booking._id === booking._id || p.booking === booking._id
          );

          const currentMonthPayment = bookingPayments.find(
            (p) => p.month === currentMonthStr && p.status === "completed"
          );
          const isCurrentMonthPaid = Boolean(currentMonthPayment);

          const nextMonthPayment = bookingPayments.find(
            (p) => p.month === nextMonthStr && p.status === "completed"
          );
          const isNextMonthPaid = Boolean(nextMonthPayment);

          let paymentStatus, paymentMonth;
          if (isCurrentMonthPaid && isNextMonthPaid) {
            paymentStatus = "paid-ahead";
            paymentMonth = nextMonthStr;
          } else if (isCurrentMonthPaid && !isNextMonthPaid) {
            paymentStatus = "unpaid";
            paymentMonth = nextMonthStr;
            total += monthlyRent;
          } else if (isCurrentMonthPaid) {
            paymentStatus = "paid";
            paymentMonth = currentMonthStr;
          } else {
            paymentStatus = "unpaid";
            paymentMonth = currentMonthStr;
            total += monthlyRent;
          }

          const relevantPayment =
            paymentMonth === currentMonthStr
              ? currentMonthPayment
              : nextMonthPayment;

          return {
            ...booking,
            monthlyRent,
            paymentStatus,
            paymentMonth,
            paymentId: relevantPayment?._id || null,
            paymentDetails: relevantPayment || null,
          };
        })
      );

      setBookings(bookingsWithRent);
      setPayments(fetchedPayments);
      setTotalDue(total);
      setDueDate(calculatedDueDate);

      const daysUntilDue = Math.max(
        0,
        Math.ceil((calculatedDueDate - currentDate) / (1000 * 60 * 60 * 24))
      );
      const progressValue = ((30 - daysUntilDue) / 30) * 100;
      setProgress(progressValue);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [currentMonthStr, nextMonthStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const paymentId = query.get("paymentId");
    const status = query.get("status");

    if (paymentId && status) {
      if (status === "success") {
        toast.success("Payment completed successfully");
        setRefreshTrigger((prev) => prev + 1);
      } else if (status === "failed") {
        toast.error("Payment failed. Please try again.");
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const initiatePayment = async (booking) => {
    try {
      setProcessingPayment(true);
      const existingPaymentCheck = await axios.post(
        "http://localhost:5000/api/payments/check",
        {
          bookingId: booking._id,
          month: booking.paymentMonth,
        },
        { withCredentials: true }
      );

      if (existingPaymentCheck.data?.isPaid) {
        toast.info("Payment already completed for this month");
        setRefreshTrigger((prev) => prev + 1);
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/payments/create",
        {
          bookingId: booking._id,
          month: booking.paymentMonth,
          amount: booking.monthlyRent,
        },
        { withCredentials: true }
      );

      if (response.data.paymentUrl) {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = response.data.paymentUrl;
        Object.entries(response.data.paymentData).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        toast.success("Payment processed successfully");
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message;
      if (errorMsg?.includes("already")) {
        setRefreshTrigger((prev) => prev + 1);
        toast.info("Payment already processed. Updating status...");
      } else {
        toast.error(errorMsg || "Failed to initiate payment");
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const terminateBooking = async (bookingId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/bookings/terminate",
        { bookingId },
        { withCredentials: true }
      );
      toast.success("Booking terminated successfully");
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to terminate booking"
      );
    }
  };

  const paymentHistory = payments
    .filter((p) => p.status === "completed")
    .map((p) => {
      const booking = bookings.find(
        (b) => b._id === (p.booking._id || p.booking)
      );
      return {
        id: p._id,
        date: format(new Date(p.createdAt), "yyyy-MM-dd"),
        amount: p.amount,
        status: "Paid",
        propertyTitle: booking?.property?.title || "Unknown Property",
        month: p.month,
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Current Rent Payments</CardTitle>
              <CardDescription>
                {format(currentMonthStart, "MMMM yyyy")} -{" "}
                {format(nextMonthStart, "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-gray-600">No active bookings</p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col sm:flex-row items-start bg-white dark:bg-[#0f172b] border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      <img
                        src={
                          booking.property.images?.[0]?.url ||
                          "/placeholder-property.jpg"
                        }
                        alt={booking.property.title}
                        className="w-full sm:w-24 h-16 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {booking.property.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(booking.startDate), "PPP")} -{" "}
                          {format(new Date(booking.endDate), "PPP")}
                        </div>
                        <div className="text-sm font-medium">
                          Monthly Rent: NPR {booking.monthlyRent.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          Payment For:{" "}
                          {format(
                            parseISO(booking.paymentMonth + "-01"),
                            "MMMM yyyy"
                          )}
                        </div>
                        <div className="text-sm">
                          Status:{" "}
                          <Badge
                            variant={
                              booking.paymentStatus === "paid-ahead"
                                ? "default"
                                : booking.paymentStatus === "unpaid"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {booking.paymentStatus === "paid-ahead"
                              ? "Paid Ahead"
                              : booking.paymentStatus === "unpaid"
                              ? "Unpaid"
                              : "Paid"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                        {booking.paymentStatus === "unpaid" && (
                          <Button
                            onClick={() => initiatePayment(booking)}
                            disabled={loading || processingPayment}
                          >
                            {processingPayment ? "Processing..." : "Pay Now"}
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          onClick={() => terminateBooking(booking._id)}
                          disabled={loading}
                        >
                          Terminate Booking
                        </Button>
                      </div>
                    </div>
                  ))
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total Due</span>
                  <span>NPR {totalDue.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment Due</CardTitle>
              <CardDescription>Next payment deadline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-4xl font-bold">
                  {dueDate
                    ? Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24))
                    : "-"}
                </div>
                <div className="text-muted-foreground">days remaining</div>
                <Progress value={progress} className="h-2" />
                <div className="text-sm text-muted-foreground">
                  Due by: {dueDate ? format(dueDate, "PPP") : "-"}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your recent payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentHistory.length === 0 ? (
                <p className="text-sm text-gray-600">No payment history yet</p>
              ) : (
                paymentHistory.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between flex-wrap"
                  >
                    <div>
                      <div className="font-medium">{payment.propertyTitle}</div>
                      <div className="text-sm text-muted-foreground">
                        {format(parseISO(payment.month + "-01"), "MMM yyyy")}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">NPR {payment.amount}</div>
                      <Badge variant="default">Paid</Badge>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
            <CardFooter>
              {paymentHistory.length > 0 && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="w-full">
                      View All Payments
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
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
                            <div className="font-medium">
                              {payment.propertyTitle}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {format(
                                parseISO(payment.month + "-01"),
                                "MMM yyyy"
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Paid on: {payment.date}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              NPR {payment.amount}
                            </div>
                            <Badge variant="outline">Paid</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Billing;
