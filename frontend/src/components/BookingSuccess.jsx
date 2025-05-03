import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get("bookingId");
  const paymentId = searchParams.get("paymentId");

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            Booking Confirmed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            Congratulations! {paymentId ? "Your payment" : "Your booking"} (ID:{" "}
            {paymentId ? paymentId : bookingId}) has been confirmed. You'll
            receive a confirmation email with all the details.
          </p>
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/profile")}
            >
              View Bookings
            </Button>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingSuccess;
