import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { XCircle } from "lucide-react";

const BookingFaliure = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <XCircle className="h-6 w-6 text-red-500" />
            Booking Failed
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            We're sorry, but there was an issue processing your payment. Please
            try again or contact support if the problem persists.
          </p>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
            <Button onClick={() => navigate(-1)}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingFaliure;
