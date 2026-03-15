// Live Truck Tracking Types

export interface TrackingTrip {
  id: string;
  truckId: string;
  driverId: string;
  containerNumber: string;
  blNumber: string;
  customer: string;
  origin: string;
  destination: string;
  pickupDate: string;
  deliveryDate: string | null;
  status: string;
  notes?: string;
  // Tracking fields
  trackingToken: string | null;
  trackingUrl: string | null;
  trackingActive: boolean;
  customerAccepted: boolean;
  customerAcceptedAt: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  pickupLocation: string | null;
  deliveryLocation: string | null;
  driverName: string | null;
  driverPhone: string | null;
  truckNumber: string | null;
  cargoDescription: string | null;
  estimatedDeliveryTime: string | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  arrivedAtPickupTime: string | null;
  distanceKm: number;
  deliveryOtp: string | null;
  deliveryConfirmedBy: string | null;
  podUrl: string | null;
  tripCost: number;
  driverPayment: number;
  fuelCost: number;
}

export interface GpsLog {
  id: string;
  tripId: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  recordedAt: string;
}

export type TripTrackingStatus = 'scheduled' | 'arrived_at_pickup' | 'in-transit' | 'delivered' | 'completed';

export function mapTripFromDb(t: any): TrackingTrip {
  return {
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
    status: t.status,
    notes: t.notes,
    trackingToken: t.tracking_token,
    trackingUrl: t.tracking_url,
    trackingActive: t.tracking_active || false,
    customerAccepted: t.customer_accepted || false,
    customerAcceptedAt: t.customer_accepted_at,
    customerPhone: t.customer_phone,
    customerEmail: t.customer_email,
    pickupLocation: t.pickup_location,
    deliveryLocation: t.delivery_location,
    driverName: t.driver_name,
    driverPhone: t.driver_phone,
    truckNumber: t.truck_number,
    cargoDescription: t.cargo_description,
    estimatedDeliveryTime: t.estimated_delivery_time,
    actualStartTime: t.actual_start_time,
    actualEndTime: t.actual_end_time,
    arrivedAtPickupTime: t.arrived_at_pickup_time,
    distanceKm: Number(t.distance_km) || 0,
    deliveryOtp: t.delivery_otp,
    deliveryConfirmedBy: t.delivery_confirmed_by,
    podUrl: t.pod_url,
    tripCost: Number(t.trip_cost) || 0,
    driverPayment: Number(t.driver_payment) || 0,
    fuelCost: Number(t.fuel_cost) || 0,
  };
}

export function mapGpsFromDb(g: any): GpsLog {
  return {
    id: g.id,
    tripId: g.trip_id,
    latitude: Number(g.latitude),
    longitude: Number(g.longitude),
    speed: Number(g.speed) || 0,
    heading: Number(g.heading) || 0,
    accuracy: Number(g.accuracy) || 0,
    recordedAt: g.recorded_at,
  };
}
