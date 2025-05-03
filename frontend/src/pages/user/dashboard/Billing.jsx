/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
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
} from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";
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
  const [totalDue, setTotalDue] = useState(0);
  const [dueDate, setDueDate] = useState(null);
  const [progress, setProgress] = useState(0);

  // Calculate current month and due date
  const currentDate = new Date();
  const currentMonthStr = format(currentDate, "yyyy-MM"); // Current month (e.g., 2025-05)
  const nextMonth = addMonths(currentDate, 1);
  const calculatedDueDate = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth(),
    7
  );

  // Fetch bookings and payments
  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings
      const bookingResponse = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      const fetchedBookings = bookingResponse.data.data;

      // Fetch payments
      const paymentResponse = await axios.get(
        "http://localhost:5000/api/payments/my-payments",
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      const fetchedPayments = paymentResponse.data.data;

      // Filter active bookings (confirmed, within rental period)
      const activeBookings = fetchedBookings.filter((booking) => {
        const start = new Date(booking.startDate);
        const end = new Date(booking.endDate);
        return (
          booking.status === "confirmed" &&
          start <= currentDate &&
          end >= startOfMonth(currentDate)
        );
      });

      // Calculate monthly rent and payment status
      let total = 0;
      const bookingsWithRent = activeBookings.map((booking) => {
        const months =
          differenceInMonths(
            new Date(booking.endDate),
            new Date(booking.startDate)
          ) || 1;
        const oneTimeFees = 195 + (booking.securityDeposit || 0); // Service fee ($120) + Cleaning fee ($75)
        const monthlyRent = (booking.totalAmount - oneTimeFees) / months;

        // Check payment for current month
        const currentPayment = fetchedPayments.find(
          (p) =>
            p.booking.toString() === booking._id.toString() &&
            p.month === currentMonthStr
        );
        const isCurrentPaid =
          currentPayment && currentPayment.status === "completed";

        // If current month is paid, check next month
        let paymentMonth = currentMonthStr;
        let paymentStatus = isCurrentPaid ? "completed" : "pending";
        if (isCurrentPaid) {
          const nextMonthStr = format(addMonths(currentDate, 1), "yyyy-MM");
          const nextPayment = fetchedPayments.find(
            (p) =>
              p.booking.toString() === booking._id.toString() &&
              p.month === nextMonthStr
          );
          paymentMonth = nextMonthStr;
          paymentStatus =
            nextPayment && nextPayment.status === "completed"
              ? "completed"
              : "pending";
        }

        if (!isCurrentPaid || (isCurrentPaid && paymentStatus === "pending")) {
          total += monthlyRent;
        }

        return {
          ...booking,
          monthlyRent,
          paymentStatus,
          paymentMonth,
        };
      });

      setBookings(bookingsWithRent);
      setPayments(fetchedPayments);
      setTotalDue(total);

      // Set due date and progress
      setDueDate(calculatedDueDate);
      const daysUntilDue = Math.max(
        0,
        Math.ceil((calculatedDueDate - currentDate) / (1000 * 60 * 60 * 24))
      );
      const progressValue = ((30 - daysUntilDue) / 30) * 100;
      setProgress(progressValue);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initiate eSewa payment for a specific booking's monthly rent
  const initiatePayment = async (booking) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/payments/create",
        {
          bookingId: booking._id,
          month: booking.paymentMonth,
          amount: booking.monthlyRent,
        },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      const { paymentUrl, paymentData } = response.data;
      const form = document.createElement("form");
      form.method = "POST";
      form.action = paymentUrl;
      Object.entries(paymentData).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      document.body.appendChild(form);
      form.submit();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to initiate payment"
      );
    }
  };

  // Terminate a booking
  const terminateBooking = async (bookingId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/bookings/terminate",
        { bookingId },
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      toast.success("Booking terminated successfully");
      fetchData(); // Refresh bookings
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to terminate booking"
      );
    }
  };

  // Filter payment history (completed payments)
  const paymentHistory = payments
    .filter((p) => p.status === "completed")
    .map((p) => {
      const booking = bookings.find(
        (b) => b._id.toString() === p.booking.toString()
      );
      return {
        id: p._id,
        date: format(new Date(p.createdAt), "yyyy-MM-dd"),
        amount: p.amount,
        status: "Paid",
        propertyTitle: booking ? booking.property.title : "Unknown Property",
      };
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Rent Payments */}
        <div className="lg:w-2/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Current Rent Payments</CardTitle>
              <CardDescription>
                Your rent for {format(new Date(currentMonthStr), "MMMM yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-600">Loading bookings...</p>
                ) : bookings.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    No active bookings for{" "}
                    {format(new Date(currentMonthStr), "MMMM yyyy")}.
                  </p>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking._id}
                      className="flex flex-col sm:flex-row items-start bg-white dark:bg-[#0f172b] border rounded-lg shadow-sm hover:shadow-md transition-shadow p-4"
                    >
                      <img
                        src={
                          booking.property.images?.[0].url ||
                          "/placeholder-property.jpg"
                        }
                        alt={`${booking.property.title} thumbnail`}
                        className="w-full sm:w-24 h-16 object-cover rounded-md mb-4 sm:mb-0 sm:mr-4"
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {booking.property.title}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Booking ID: {booking._id}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Check-in: {format(new Date(booking.startDate), "PPP")}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Check-out: {format(new Date(booking.endDate), "PPP")}
                        </div>
                        <div className="text-sm font-medium">
                          Rent Due: NPR {booking.monthlyRent.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          Month:{" "}
                          {format(new Date(booking.paymentMonth), "MMMM yyyy")}
                        </div>
                        <div className="text-sm">
                          Status:{" "}
                          <Badge>
                            {booking.paymentStatus === "completed"
                              ? "Paid"
                              : "Unpaid"}
                          </Badge>
                        </div>
                      </div>
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col gap-2">
                        {booking.paymentStatus === "pending" && (
                          <Button
                            onClick={() => initiatePayment(booking)}
                            disabled={loading}
                          >
                            Pay Now
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

        {/* Right Column - Payment History and Due Date */}
        <div className="lg:w-1/3 space-y-6">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Payment Due</CardTitle>
              <CardDescription>Next payment deadline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="text-4xl font-bold">
                  {Math.ceil((dueDate - currentDate) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="text-muted-foreground">days remaining</div>
                <Progress value={progress} className="h-2" />
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
              <CardDescription>Your recent rent payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentHistory.slice(0, 3).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{payment.propertyTitle}</div>
                    <div className="text-sm text-muted-foreground">
                      {payment.date}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">NPR {payment.amount}</div>
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
                          <div className="font-medium">
                            {payment.propertyTitle}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {payment.date}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            NPR {payment.amount}
                          </div>
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
