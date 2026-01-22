import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Truck as TruckIcon, Users, Route } from "lucide-react";
import { TruckFleetTable } from "@/components/trucking/TruckFleetTable";
import { DriverTable } from "@/components/trucking/DriverTable";
import { TripTable } from "@/components/trucking/TripTable";
import { TruckingStats } from "@/components/trucking/TruckingStats";
import { trucks, drivers, trips } from "@/data/truckingData";

export default function Trucking() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("trips");

  const filteredTrips = trips.filter(
    (trip) =>
      trip.containerNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.blNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.model.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDrivers = drivers.filter(
    (driver) =>
      driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.phone.includes(searchQuery) ||
      driver.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trucking Management</h1>
          <p className="text-sm text-muted-foreground">
            Manage trucks, drivers, trips, and container returns
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" />
            New Trip
          </Button>
        </div>
      </div>

      {/* Stats */}
      <TruckingStats trucks={trucks} drivers={drivers} trips={trips} />

      {/* Search & Tabs */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search trips, trucks, drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="trips" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Trips ({filteredTrips.length})
          </TabsTrigger>
          <TabsTrigger value="trucks" className="flex items-center gap-2">
            <TruckIcon className="h-4 w-4" />
            Trucks ({filteredTrucks.length})
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Drivers ({filteredDrivers.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trips" className="mt-4">
          <TripTable trips={filteredTrips} trucks={trucks} drivers={drivers} />
        </TabsContent>

        <TabsContent value="trucks" className="mt-4">
          <TruckFleetTable trucks={filteredTrucks} />
        </TabsContent>

        <TabsContent value="drivers" className="mt-4">
          <DriverTable drivers={filteredDrivers} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
