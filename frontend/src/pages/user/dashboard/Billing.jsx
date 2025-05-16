/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { toast } from "react-toastify";
import { format, parseISO, addMonths, startOfMonth } from "date-fns";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  DollarSign,
} from "lucide-react";

const Billing = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState({});
  const [terminatingBooking, setTerminatingBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/bookings/my-bookings",
        { withCredentials: true }
      );
      console.log("Fetched bookings:", response.data.data);
      setBookings(response.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch bookings");
      toast.error(err.response?.data?.message || "Failed to fetch bookings");
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (bookingId, month) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/bookings/check-payment",
        { bookingId, month },
        { withCredentials: true }
      );
      return response.data.isPaid;
    } catch (err) {
      console.error("Error checking payment status:", err);
      return false;
    }
  };

  const initiateMonthlyPayment = async (booking) => {
    try {
      setProcessingPayment((prev) => ({ ...prev, [booking._id]: true }));

      // Validate required fields
      if (!booking?._id) {
        throw new Error("Missing booking ID");
      }
      if (!booking?.paymentBreakdown || !booking.paymentBreakdown.monthlyRent) {
        throw new Error("Missing monthly rent information");
      }

      const currentMonth = format(new Date(), "yyyy-MM");
      const payload = {
        bookingId: booking._id,
        month: currentMonth,
        amount: booking.paymentBreakdown.monthlyRent,
      };

      console.log("Initiating monthly payment with payload:", payload);

      const isPaid = await checkPaymentStatus(booking._id, currentMonth);
      if (isPaid) {
        toast.info("This month's payment is already completed");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/bookings/create-monthly-payment",
        payload,
        { withCredentials: true }
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
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error(
        err.message ||
          err.response?.data?.message ||
          "Failed to initiate monthly payment"
      );
    } finally {
      setProcessingPayment((prev) => ({ ...prev, [booking._id]: false }));
    }
  };

  const terminateBooking = async (bookingId) => {
    try {
      setTerminatingBooking(bookingId);
      const response = await axios.post(
        "http://localhost:5000/api/bookings/terminate",
        { bookingId },
        { withCredentials: true }
      );
      toast.success(response.data.message);
      await fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to terminate booking");
    } finally {
      setTerminatingBooking(null);
    }
  };

  const getPaymentStatus = (booking, month) => {
    const payment = booking.monthlyPayments.find((p) => p.month === month);
    return payment ? payment.status : "pending";
  };

  const getUpcomingMonths = (startDate, endDate) => {
    const months = [];
    let current = startOfMonth(parseISO(startDate));
    const end = parseISO(endDate);
    while (current <= end) {
      months.push(format(current, "yyyy-MM"));
      current = addMonths(current, 1);
    }
    return months;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Billing & Payments</h1>
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Billing & Payments</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
          <Button
            onClick={fetchBookings}
            variant="link"
            className="ml-4 text-blue-600"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Billing & Payments</h1>
        <div className="bg-gray-100 p-6 rounded text-center">
          <p className="text-gray-600">You haven't made any bookings yet.</p>
          <a
            href="/dashboard/my-properties"
            className="text-blue-600 hover:underline mt-2 inline-block"
          >
            Browse Properties
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Billing & Payments</h1>
      <div className="space-y-6">
        {bookings.map((booking) => (
          <Card key={booking._id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  {booking.property?.title || "Unknown Property"}
                </CardTitle>
                <Badge
                  variant={
                    booking.status === "confirmed"
                      ? "default"
                      : booking.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {booking.property?.address?.street || "N/A"},{" "}
                {booking.property?.address?.city || "N/A"}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Booking Period
                  </p>
                  <p className="font-medium">
                    {booking.startDate
                      ? format(parseISO(booking.startDate), "MMM d, yyyy")
                      : "N/A"}{" "}
                    -{" "}
                    {booking.endDate
                      ? format(parseISO(booking.endDate), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Initial Payment
                  </p>
                  <p className="font-medium">
                    NPR {booking.totalAmount || "N/A"}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Payment Breakdown</h3>
                {booking.paymentBreakdown ? (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>First Month's Rent</span>
                      <span>
                        NPR {booking.paymentBreakdown.monthlyRent || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Deposit (Refundable)</span>
                      <span>
                        NPR {booking.paymentBreakdown.securityDeposit || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Fee</span>
                      <span>
                        NPR {booking.paymentBreakdown.serviceFee || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cleaning Fee</span>
                      <span>
                        NPR {booking.paymentBreakdown.cleaningFee || "N/A"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">
                    Payment breakdown not available
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-3">
                <h3 className="font-semibold">Monthly Payments</h3>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!booking.paymentBreakdown}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      View Payment Schedule
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <ScrollArea className="h-64">
                      {booking.paymentBreakdown ? (
                        getUpcomingMonths(
                          booking.startDate,
                          booking.endDate
                        ).map((month) => {
                          const status = getPaymentStatus(booking, month);
                          return (
                            <div
                              key={month}
                              className="flex justify-between items-center p-2 border-b"
                            >
                              <div>
                                <p className="text-sm font-medium">
                                  {format(parseISO(`${month}-01`), "MMMM yyyy")}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  NPR{" "}
                                  {booking.paymentBreakdown.monthlyRent ||
                                    "N/A"}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                {status === "completed" && (
                                  <CheckCircle className="h-4 w-4 text-green-500" />
                                )}
                                {status === "failed" && (
                                  <XCircle className="h-4 w-4 text-red-500" />
                                )}
                                {status === "pending" && (
                                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                                )}
                                <span className="text-xs capitalize">
                                  {status}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <p className="text-sm text-destructive">
                          Payment schedule unavailable
                        </p>
                      )}
                    </ScrollArea>
                  </PopoverContent>
                </Popover>
              </div>

              {booking.refundedAmount > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-700">
                    Refund Processed: NPR {booking.refundedAmount.toFixed(2)}
                  </p>
                  <p className="text-xs text-green-600">
                    Refund includes security deposit and prorated rent.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              {booking.status === "confirmed" && (
                <>
                  <Button
                    onClick={() => initiateMonthlyPayment(booking)}
                    disabled={
                      processingPayment[booking._id] ||
                      !booking.paymentBreakdown ||
                      !booking._id
                    }
                    className="w-full sm:w-auto"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    {processingPayment[booking._id]
                      ? "Processing..."
                      : "Pay Monthly Rent"}
                  </Button>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="w-full sm:w-auto"
                        disabled={terminatingBooking === booking._id}
                      >
                        Terminate Booking
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Confirm Termination</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">
                        Are you sure you want to terminate this booking? You
                        will receive a refund of your security deposit (NPR{" "}
                        {booking.paymentBreakdown?.securityDeposit || 0}) and a
                        prorated portion of the current month's rent.
                      </p>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setTerminatingBooking(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => terminateBooking(booking._id)}
                          disabled={terminatingBooking === booking._id}
                        >
                          {terminatingBooking === booking._id
                            ? "Terminating..."
                            : "Confirm"}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Billing;
