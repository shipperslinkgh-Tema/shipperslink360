import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Truck, Driver, Trip } from "@/types/trucking";

export function useTrucks() {
  return useQuery({
    queryKey: ["trucks"],
    queryFn: async (): Promise<Truck[]> => {
      const { data, error } = await supabase
        .from("trucks")
        .select("*")
        .order("registration_number");
      if (error) throw error;
      return (data || []).map((t: any): Truck => ({
        id: t.id,
        registrationNumber: t.registration_number,
        make: t.make,
        model: t.model,
        type: t.type,
        capacity: t.capacity || "",
        status: t.status,
      }));
    },
  });
}

export function useDrivers() {
  return useQuery({
    queryKey: ["drivers"],
    queryFn: async (): Promise<Driver[]> => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("name");
      if (error) throw error;
      return (data || []).map((d: any): Driver => ({
        id: d.id,
        name: d.name,
        phone: d.phone || "",
        licenseNumber: d.license_number || "",
        licenseExpiry: d.license_expiry || "",
        status: d.status,
      }));
    },
  });
}

export function useTrips() {
  return useQuery({
    queryKey: ["trucking-trips"],
    queryFn: async (): Promise<Trip[]> => {
      const { data, error } = await supabase
        .from("trucking_trips")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((t: any): Trip => ({
        id: t.id,
        truckId: t.truck_id,
        driverId: t.driver_id,
        containerNumber: t.container_number || "",
        blNumber: t.bl_number || "",
        customer: t.customer || "",
        origin: t.origin,
        destination: t.destination,
        pickupDate: t.pickup_date || "",
        deliveryDate: t.delivery_date,
        containerReturnDate: t.container_return_date,
        containerReturnLocation: t.container_return_location || "",
        containerReturned: t.container_returned || false,
        tripCost: Number(t.trip_cost) || 0,
        driverPayment: Number(t.driver_payment) || 0,
        fuelCost: Number(t.fuel_cost) || 0,
        status: t.status,
        notes: t.notes,
      }));
    },
  });
}
