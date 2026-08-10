import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listConsignments from "./tools/list-consignments";
import getConsignment from "./tools/get-consignment";
import listTrips from "./tools/list-trips";
import listInvoices from "./tools/list-invoices";
import listCustomers from "./tools/list-customers";
import listNotifications from "./tools/list-notifications";
import whoami from "./tools/whoami";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "shipperslink360",
  title: "ShippersLink360",
  version: "0.1.0",
  instructions:
    "Tools for ShippersLink360, the SLAC freight and logistics platform. Read consignments and their tracking events, trucking trips, customers, finance invoices, and your notifications. All data access runs as the signed-in staff member and respects their department permissions.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    whoami,
    listConsignments,
    getConsignment,
    listTrips,
    listCustomers,
    listInvoices,
    listNotifications,
  ],
});
