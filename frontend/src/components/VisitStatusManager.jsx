/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  AlertCircle,
  CheckCircle2,
  XCircle,
  CalendarCheck,
  Mail,
  Phone,
  Home,
  User,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const statusIcons = {
  pending: <AlertCircle className="h-4 w-4 text-yellow-500" />,
  confirmed: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  cancelled: <XCircle className="h-4 w-4 text-red-500" />,
  completed: <CalendarCheck className="h-4 w-4 text-blue-500" />,
};

const statusMessages = {
  pending: "pending approval",
  confirmed: "confirmed",
  cancelled: "cancelled",
  completed: "completed",
};

const VisitStatusManager = ({ propertyId }) => {
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [notes, setNotes] = useState("");
  const [visitLoading, setVisitLoading] = useState(false);
  const [showAllVisits, setShowAllVisits] = useState(false);
  const [displayCount, setDisplayCount] = useState(3);

  // Define valid status transitions
  const validTransitions = {
    pending: ["confirmed", "cancelled"],
    confirmed: ["completed", "cancelled"],
    cancelled: ["confirmed"],
    completed: [],
  };

  useEffect(() => {
    fetchVisits();
  }, [propertyId]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/properties/${propertyId}/visits`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setVisits(response.data);
    } catch (error) {
      console.error("Error fetching visits:", error);
      toast.error("Failed to fetch visits");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (visitId, newStatus) => {
    try {
      const visit = visits.find((v) => v._id === visitId);

      // Check if transition is valid
      if (!validTransitions[visit.status].includes(newStatus)) {
        toast.error(`Cannot change from ${visit.status} to ${newStatus}`);
        return;
      }

      // For statuses that require notes/confirmation
      if (["cancelled", "confirmed"].includes(newStatus)) {
        setSelectedVisit({
          ...visit,
          newStatus, // Store the pending status change
        });
        return;
      }

      // For immediate status changes
      await updateVisitStatus(visitId, newStatus, "");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update visit status");
    }
  };

  const updateVisitStatus = async (visitId, status, notes) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visits/${visitId}/status`,
        { status, notes },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      fetchVisits();
      toast.success(`Visit has been ${statusMessages[status]}`);
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  const confirmStatusChange = async () => {
    if (!selectedVisit) return;

    try {
      setVisitLoading(true);
      await updateVisitStatus(
        selectedVisit._id,
        selectedVisit.newStatus,
        notes
      );
      setSelectedVisit(null);
      setNotes("");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to confirm visit status"
      );
    } finally {
      setVisitLoading(false);
    }
  };

  const toggleShowAll = () => {
    setShowAllVisits(!showAllVisits);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No visit requests yet</p>
      </div>
    );
  }

  const displayedVisits = visits.slice(0, displayCount);
  const hasMoreVisits = displayCount < visits.length;

  return (
    <div className="space-y-4">
      {/* Status Change Confirmation Dialog */}
      {selectedVisit && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-xl mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {statusIcons[selectedVisit.newStatus]}
                Confirm {selectedVisit.newStatus} visit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4l">
                <div className="grid sm:grid-cols-2 gap-4 grid-cols-1 mb-4">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{selectedVisit.visitorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{selectedVisit.visitorEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{selectedVisit.visitorPhone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4" />
                    <span>{selectedVisit.property?.title || "Property"}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="notes">
                    {selectedVisit.newStatus === "cancelled"
                      ? "Cancellation reason"
                      : "Additional notes"}
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      selectedVisit.newStatus === "cancelled"
                        ? "Let the visitor know why you need to cancel..."
                        : "Add any special instructions..."
                    }
                    required
                    className="border-1 border-gray-400 my-2"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedVisit(null);
                  setNotes("");
                }}
                disabled={visitLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmStatusChange}
                disabled={visitLoading || !notes.trim()}
              >
                {visitLoading
                  ? "Processing..."
                  : `Confirm ${selectedVisit.newStatus}`}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Visits List */}
      <div className="space-y-4">
        {displayedVisits.map((visit) => (
          <VisitCard
            key={visit._id}
            visit={visit}
            handleStatusChange={handleStatusChange}
            validTransitions={validTransitions}
          />
        ))}
      </div>

      {/* View All Button */}
      <div className="flex justify-center mt-6">
        <Button
          variant="outline"
          onClick={toggleShowAll}
          className="flex items-center gap-2"
        >
          {showAllVisits ? "Show Less" : "View All Visits"}
          {showAllVisits ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* All Visits Dialog */}
      <Dialog open={showAllVisits} onOpenChange={setShowAllVisits}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>All Visit Requests ({visits.length})</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {visits.map((visit) => (
              <VisitCard
                key={visit._id}
                visit={visit}
                handleStatusChange={handleStatusChange}
                validTransitions={validTransitions}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Extracted VisitCard component for reusability
const VisitCard = ({ visit, handleStatusChange, validTransitions }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              {statusIcons[visit.status]}
              {visit.visitorName}
            </CardTitle>
            <div className="text-sm text-muted-foreground">
              {new Date(visit.visitDate).toLocaleString()}
            </div>
          </div>
          <Select
            value={visit.status}
            onValueChange={(newStatus) =>
              handleStatusChange(visit._id, newStatus)
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="pending"
                disabled={!validTransitions[visit.status].includes("pending")}
              >
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  Pending
                </div>
              </SelectItem>
              <SelectItem
                value="confirmed"
                disabled={!validTransitions[visit.status].includes("confirmed")}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Confirm
                </div>
              </SelectItem>
              <SelectItem
                value="cancelled"
                disabled={!validTransitions[visit.status].includes("cancelled")}
              >
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-500" />
                  Cancel
                </div>
              </SelectItem>
              <SelectItem
                value="completed"
                disabled={!validTransitions[visit.status].includes("completed")}
              >
                <div className="flex items-center gap-2">
                  <CalendarCheck className="h-4 w-4 text-blue-500" />
                  Complete
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{visit.visitorEmail}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{visit.visitorPhone}</span>
          </div>
          {visit.message && (
            <div className="col-span-2">
              <p className="font-medium">Visitor Message:</p>
              <p className="text-muted-foreground">{visit.message}</p>
            </div>
          )}
        </div>
      </CardContent>
      {visit.statusHistory?.length > 0 && (
        <CardFooter className="pt-0">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium">Status History:</p>
            <ul className="list-disc pl-5 space-y-1">
              {visit.statusHistory.map((history, idx) => (
                <li key={idx}>
                  {new Date(history.changedAt).toLocaleString()} -{" "}
                  {history.status} {history.notes && `(${history.notes})`}
                </li>
              ))}
            </ul>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default VisitStatusManager;
