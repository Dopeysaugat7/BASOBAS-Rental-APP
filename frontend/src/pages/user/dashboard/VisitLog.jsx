/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import axios from "axios";
import {
  Calendar,
  Mail,
  Phone,
  Home,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  MoreVertical,
  User,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

const statusIcons = {
  pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  confirmed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  completed: <CalendarCheck className="h-4 w-4 text-blue-500" />,
};

const statusVariants = {
  pending: "bg-yellow-500/10 text-yellow-500",
  confirmed: "bg-green-500/10 text-green-500",
  cancelled: "bg-red-500/10 text-red-500",
  completed: "bg-blue-500/10 text-blue-500",
};

const statusMessages = {
  pending: "pending approval",
  confirmed: "confirmed",
  cancelled: "cancelled",
  completed: "completed",
};

const validTransitions = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "cancelled"],
  cancelled: ["confirmed"],
  completed: [],
};

export default function VisitsDashboard() {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [notes, setNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "http://localhost:5000/api/visits/host",
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      setVisits(response.data);
    } catch (error) {
      toast.error("Failed to fetch visits");
    } finally {
      setLoading(false);
    }
  };

  const updateVisitStatus = async (visitId, status, notes = "") => {
    try {
      await axios.put(
        `http://localhost:5000/api/visits/${visitId}/status`,
        { status, notes },
        { withCredentials: true }
      );
      fetchVisits();
      toast.success(`Visit has been ${statusMessages[status]}`);
      setIsDialogOpen(false);
      setNotes("");
      setActionType("");
    } catch (error) {
      toast.error("Failed to update visit status");
    }
  };

  const handleStatusAction = (visit, action) => {
    setSelectedVisit(visit);
    setActionType(action);
    setIsDialogOpen(true);
  };

  const filteredVisits = visits.filter((visit) => {
    const matchesStatus =
      statusFilter === "all" || visit.status === statusFilter;
    const matchesSearch =
      visit.visitorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      visit.property?.title
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      visit.visitorEmail.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <Skeleton className="h-10 w-full md:w-64" />
          <Skeleton className="h-10 w-full md:w-48" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col gap-6">
        {/* Header with Search and Filter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Visit Requests
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, property or email..."
                className="pl-10 w-full bg-white dark:bg-gray-800"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-gray-800">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="Filter status" />
                </div>
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800">
                <SelectItem
                  value="all"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  All Statuses
                </SelectItem>
                <SelectItem
                  value="pending"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Pending
                </SelectItem>
                <SelectItem
                  value="confirmed"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Confirmed
                </SelectItem>
                <SelectItem
                  value="cancelled"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelled
                </SelectItem>
                <SelectItem
                  value="completed"
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Completed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Visits List */}
        <div className="space-y-4">
          {filteredVisits.length > 0 ? (
            filteredVisits.map((visit) => (
              <VisitCard
                key={visit._id}
                visit={visit}
                onStatusChange={handleStatusAction}
              />
            ))
          ) : (
            <Card className="p-8 text-center bg-white dark:bg-gray-800 shadow-sm rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                No visits found matching your criteria
              </p>
            </Card>
          )}
        </div>

        {/* Visit Details Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[625px] bg-white dark:bg-[#0f172b] rounded-lg">
            {selectedVisit && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-gray-900 dark:text-white">
                    {actionType === "confirm" && "Confirm Visit Request"}
                    {actionType === "cancel" && "Cancel Visit Request"}
                    {actionType === "complete" && "Complete Visit"}
                    {!actionType && "Visit Details"}
                  </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Visitor Name
                      </Label>
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                        <User className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedVisit.visitorName}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Property
                      </Label>
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                        <Home className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedVisit.property?.title || "Property"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Email
                      </Label>
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                        <Mail className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedVisit.visitorEmail}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Phone
                      </Label>
                      <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                        <Phone className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-900 dark:text-white">
                          {selectedVisit.visitorPhone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-700 dark:text-gray-300">
                      Visit Date & Time
                    </Label>
                    <div className="flex items-center gap-2 p-2 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                      <Calendar className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-900 dark:text-white">
                        {new Date(selectedVisit.visitDate).toLocaleString([], {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  {selectedVisit.message && (
                    <div className="space-y-2">
                      <Label className="text-gray-700 dark:text-gray-300">
                        Visitor Message
                      </Label>
                      <div className="p-3 border rounded-lg bg-gray-50 dark:bg-[#0f172b]">
                        <p className="text-gray-900 dark:text-white">
                          {selectedVisit.message}
                        </p>
                      </div>
                    </div>
                  )}

                  {(actionType === "confirm" ||
                    actionType === "cancel" ||
                    actionType === "complete") && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="notes"
                        className="text-gray-700 dark:text-gray-300"
                      >
                        {actionType === "cancel"
                          ? "Cancellation Reason (Required)"
                          : "Additional Notes"}
                      </Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                          actionType === "cancel"
                            ? "Please provide a reason for cancellation..."
                            : "Add any notes about this visit..."
                        }
                        className="min-h-[100px] bg-white dark:bg-[#0f172b] border-gray-300 dark:border-gray-600"
                        required={actionType === "cancel"}
                      />
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0 ">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      setNotes("");
                      setActionType("");
                    }}
                    className="w-full sm:w-auto"
                  >
                    Close
                  </Button>

                  {actionType === "confirm" && (
                    <Button
                      onClick={() =>
                        updateVisitStatus(selectedVisit._id, "confirmed", notes)
                      }
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      disabled={!notes.trim() && actionType === "cancel"}
                    >
                      Confirm Visit
                    </Button>
                  )}

                  {actionType === "cancel" && (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        updateVisitStatus(selectedVisit._id, "cancelled", notes)
                      }
                      className="w-full sm:w-auto"
                      disabled={!notes.trim()}
                    >
                      Cancel Visit
                    </Button>
                  )}

                  {actionType === "complete" && (
                    <Button
                      onClick={() =>
                        updateVisitStatus(selectedVisit._id, "completed", notes)
                      }
                      className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

// Reusable VisitCard component
function VisitCard({ visit, onStatusChange }) {
  return (
    <Card className="p-4 bg-white dark:bg-[#0f172b] shadow-sm hover:shadow-md transition-shadow rounded-lg">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              className={`${statusVariants[visit.status]} px-3 py-1 rounded-sm`}
            >
              <div className="flex items-center gap-2">
                {statusIcons[visit.status]}
                {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
              </div>
            </Badge>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {visit.visitorName}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" />
              <span>{visit.visitorEmail}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Home className="h-4 w-4" />
              <span>{visit.property?.title || "Property"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date(visit.visitDate).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <Clock className="h-4 w-4" />
              <span>
                {new Date(visit.visitDate).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg"
          >
            <DropdownMenuItem
              className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => onStatusChange(visit, "view")}
            >
              View Details
            </DropdownMenuItem>
            {validTransitions[visit.status].includes("confirmed") && (
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => onStatusChange(visit, "confirm")}
              >
                Confirm
              </DropdownMenuItem>
            )}
            {validTransitions[visit.status].includes("cancelled") && (
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onStatusChange(visit, "cancel")}
              >
                Cancel
              </DropdownMenuItem>
            )}
            {validTransitions[visit.status].includes("completed") && (
              <DropdownMenuItem
                className="cursor-pointer px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => onStatusChange(visit, "complete")}
              >
                Complete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
}
