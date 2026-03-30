import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  FileCheck,
  Truck,
  DollarSign,
  Users,
  Ship,
  Plane,
  Warehouse,
  BarChart3,
  Bell,
  Settings,
  CheckCircle,
  ArrowRight,
  MapPin,
  Calculator,
  Anchor,
  Layers,
  FolderArchive,
  Globe,
  ShieldCheck,
  Bot,
  Newspaper,
  ClipboardList,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  department?: string;
  content: {
    description: string;
    features: string[];
    useCases?: string[];
  };
}

const slides: Slide[] = [
  {
    id: 1,
    title: "Welcome to SLAC Operations",
    subtitle: "Comprehensive Freight & Logistics Management System",
    icon: Ship,
    color: "from-primary to-primary/70",
    content: {
      description:
        "SLAC Operations is an integrated platform designed to streamline freight forwarding, customs clearance, fleet management, and financial operations for logistics companies in Ghana.",
      features: [
        "Real-time shipment tracking across sea and air freight",
        "Automated customs declarations with ICUMS integration",
        "AI-powered duty estimation with Ghana tariff schedules",
        "Fleet and driver management with live GPS tracking",
        "Complete financial management with GHS currency support",
        "Consignment workflow engine with stage-by-stage tracking",
        "Consolidation portal for LCL and air groupage operations",
        "Warehouse management with zone-based inventory",
        "Port command center with vessel schedules and berth monitoring",
        "Secure client self-service portal for shipment & invoice visibility",
        "Comprehensive reports, analytics & automated alerts",
      ],
    },
  },
  {
    id: 2,
    title: "Dashboard Overview",
    subtitle: "Your Operations Command Center",
    icon: LayoutDashboard,
    color: "from-blue-600 to-blue-400",
    department: "All Departments",
    content: {
      description:
        "The dashboard provides a bird's-eye view of all operations, featuring key metrics, recent shipments, alerts, and quick actions for immediate decision-making.",
      features: [
        "Real-time KPI cards showing active shipments, pending clearances, and fleet status",
        "Shipment status chart with visual breakdown by status",
        "Recent shipments table with quick access to details",
        "Alerts panel for urgent items requiring attention",
        "Quick action buttons for common tasks",
        "Role-based view — each department sees relevant metrics first",
      ],
      useCases: [
        "Morning briefing: Review overnight alerts and pending tasks",
        "Client calls: Quick access to shipment status updates",
        "Management reporting: Overview of operational performance",
      ],
    },
  },
  {
    id: 3,
    title: "Consignment Workflows",
    subtitle: "End-to-End Shipment Lifecycle Management",
    icon: ClipboardList,
    color: "from-teal-600 to-teal-400",
    department: "Operations & Documentation",
    content: {
      description:
        "A structured, stage-by-stage workflow engine that tracks every consignment from document receipt through customs clearance, port processing, and final delivery — with full audit trail and officer assignment.",
      features: [
        "7-stage pipeline: Documents Received → Documentation → Customs Declaration → Duty Payment → Port Processing → Cargo Release → Delivery",
        "Kanban-style board view and table view for workflow management",
        "Officer assignment with workload tracking",
        "Stage timestamps and duration tracking for SLA monitoring",
        "Linked to customers, consolidations, and trucking trips",
        "CIF value calculation: FOB + Freight + Insurance",
        "ICUMS declaration number and duty tracking per consignment",
        "Free days monitoring with demurrage risk alerts",
        "Urgent flag for priority consignments",
        "Full audit trail of stage transitions and actions",
      ],
      useCases: [
        "Create a new consignment when documents arrive from a client",
        "Assign an officer and track progress through each clearance stage",
        "Monitor which consignments are stuck or approaching demurrage",
        "Link a consignment to a trucking trip for coordinated delivery",
        "Review audit trail to verify compliance for completed jobs",
      ],
    },
  },
  {
    id: 4,
    title: "Operations Module",
    subtitle: "Shipment Management & Tracking",
    icon: Package,
    color: "from-emerald-600 to-emerald-400",
    department: "Operations Team",
    content: {
      description:
        "Manage all shipments from booking to delivery. Track sea freight, air freight, and consolidation shipments with detailed status updates and documentation.",
      features: [
        "Create and manage shipment bookings with BL/AWB tracking",
        "Real-time status updates: Booked → In Transit → At Port → Cleared → Delivered",
        "Container and cargo details management",
        "Consignee and shipper information tracking",
        "Estimated arrival dates and milestone tracking",
        "Filter by shipment type: Sea, Air, Consolidation",
      ],
      useCases: [
        "Book new shipments and generate tracking numbers",
        "Update clients on shipment arrival times",
        "Coordinate with clearing agents on cargo details",
        "Monitor consolidation containers for groupage",
      ],
    },
  },
  {
    id: 5,
    title: "Consolidation Portal",
    subtitle: "LCL & Air Groupage Management",
    icon: Layers,
    color: "from-sky-600 to-sky-400",
    department: "Operations & Documentation",
    content: {
      description:
        "Manage consolidation shipments (LCL sea and air groupage) from planning through delivery. Track multiple shippers per container/flight, handle cargo receipts, tallying, customs clearance, and invoicing.",
      features: [
        "Create consolidations with Master BL/AWB, vessel/flight, and container details",
        "Add multiple shippers per consolidation with House BL/AWB numbers",
        "Cargo receipt and tallying: Record packages received, weights, and condition",
        "Per-shipper customs status tracking with ICUMS references",
        "HS code classification and duty/tax tracking per shipper",
        "Charge breakdown: Freight, handling, documentation, storage per shipper",
        "Demurrage monitoring with free-time countdown and daily rates",
        "Consolidation-level document management: MBL, HBL, MAWB, HAWB, packing lists",
        "Invoice generation per shipper with GHS/USD support",
        "Container type support: 20GP, 40GP, 40HC, 45HC",
      ],
      useCases: [
        "Create an LCL consolidation, add 8 shippers, and track cargo receipt for each",
        "Monitor demurrage charges on a container nearing free-time expiry",
        "Generate individual invoices for each shipper in a consolidation",
        "Track customs clearance progress for all shippers in a single container",
      ],
    },
  },
  {
    id: 6,
    title: "Customs & ICUMS",
    subtitle: "Declarations, Duty & Compliance",
    icon: FileCheck,
    color: "from-amber-600 to-amber-400",
    department: "Customs & Clearing Team",
    content: {
      description:
        "Handle all customs-related activities including ICUMS declarations, duty assessment, shipping line DO management, and GPHA port status tracking.",
      features: [
        "ICUMS declaration submission and status tracking",
        "Duty calculations with full tax breakdown (Import Duty, VAT, NHIL, GETFund, ECOWAS, AU, EXIM levies)",
        "Declaration lifecycle: Draft → Submitted → Assessed → Paid → Released",
        "Shipping line integration for Delivery Order management",
        "Demurrage tracking with free days monitoring",
        "HS code lookup and classification support",
      ],
      useCases: [
        "Submit new ICUMS declarations with HS codes and CIF values",
        "Track declaration status through each assessment stage",
        "Monitor free days to avoid demurrage charges",
        "Coordinate container pickup with shipping lines",
      ],
    },
  },
  {
    id: 7,
    title: "Shipping Line Status",
    subtitle: "Delivery Orders & Container Tracking",
    icon: Anchor,
    color: "from-blue-700 to-blue-500",
    department: "Operations & Customs",
    content: {
      description:
        "Track and manage Delivery Order (DO) status with shipping lines. Monitor container release status, terminal charges, and coordinate pickup logistics.",
      features: [
        "Delivery Order request and approval tracking",
        "Shipping line charge management and payment tracking",
        "Container release status monitoring",
        "Terminal and depot charge tracking",
        "Integration with consignment workflows for seamless handoff",
      ],
      useCases: [
        "Request a Delivery Order from the shipping line after duty payment",
        "Track DO approval status and terminal charges",
        "Coordinate container release timing with trucking schedule",
      ],
    },
  },
  {
    id: 8,
    title: "Port Command Center",
    subtitle: "GPHA Port Operations & Vessel Schedules",
    icon: Globe,
    color: "from-slate-600 to-slate-400",
    department: "Operations & Management",
    content: {
      description:
        "A centralized dashboard for monitoring port operations at Tema, Takoradi, and Kotoka. Track vessel schedules, berth assignments, container locations, and port congestion in real time.",
      features: [
        "Vessel arrival and departure schedules for all Ghana ports",
        "Berth assignment and terminal monitoring",
        "Container location tracking within port zones",
        "Port congestion indicators and waiting time estimates",
        "GPHA port status integration for Tema and Takoradi",
        "Quick lookup by vessel name, voyage number, or container",
      ],
      useCases: [
        "Check when a vessel is expected to berth at Tema port",
        "Monitor port congestion before scheduling a truck for pickup",
        "Verify container location within the port terminal",
        "Plan operations around vessel schedules and berth availability",
      ],
    },
  },
  {
    id: 9,
    title: "Fleet & Trucking",
    subtitle: "Trip Scheduling, Drivers & Cost Management",
    icon: Truck,
    color: "from-purple-600 to-purple-400",
    department: "Fleet & Logistics Team",
    content: {
      description:
        "Manage your truck fleet, driver details, trip scheduling, and logistics operations. Create trips, assign drivers, track costs, and activate live GPS tracking — all from one module.",
      features: [
        "Vehicle & Driver section: Select truck type (40ft, 20ft, Towing, Cargo), enter truck number, driver name, phone, and license",
        "Customer & Cargo section: Enter customer name, container number, and BL number",
        "Route & Schedule section: Specify origin, destination, pickup date, and expected delivery",
        "Financials section (GHS): Record trip cost, driver payment, and fuel cost",
        "Container Return section: Track return location and return date",
        "Tracking column in Trips table: Activate tracking, copy link, share via WhatsApp, or open link",
        "Real-time trip status: Scheduled → At Pickup → In Transit → Delivered",
        "All truck and driver fields are free-text inputs for flexibility",
      ],
      useCases: [
        "Create a new trip and immediately activate live tracking from the Trips table",
        "Copy the tracking link and send it to the customer via WhatsApp in one click",
        "Track trip financials including cost, driver payment, and fuel expenses",
        "Monitor container return dates and locations after delivery",
      ],
    },
  },
  {
    id: 10,
    title: "Live Truck Tracking",
    subtitle: "Real-Time GPS Fleet Monitoring with Google Maps",
    icon: MapPin,
    color: "from-red-600 to-red-400",
    department: "Fleet & Operations Team",
    content: {
      description:
        "A complete real-time GPS tracking system with interactive maps, Google Maps integration, fleet overview, driver mobile interface, and customer-facing tracking portal — no app installation required.",
      features: [
        "Interactive OpenStreetMap with live truck positions, route trails, and custom markers",
        "Google Maps integration: Open any truck's live position directly in Google Maps for navigation",
        "Fleet Overview tab: Monitor all active trucks on a single map with real-time status",
        "All Trips tab: Full trip table with status, route, driver, and tracking controls",
        "Activate tracking from the Trucking page or Live Tracking page — generates unique URL & OTP",
        "Copy tracking link or share via WhatsApp with pre-filled customer message",
        "Customer tracking portal: Animated progress bar, live map, driver contact, and ETA",
        "Driver mobile interface: GPS auto-recording, milestone buttons (Arrived, Start Trip, End Trip)",
        "OTP-verified delivery confirmation with Proof of Delivery generation",
        "Live telemetry: Speed, heading, distance, and trip duration",
      ],
      useCases: [
        "Activate tracking on a trip → copy link → WhatsApp it to the customer instantly",
        "Click 'Open in Google Maps' to navigate to a truck's live location",
        "Monitor fleet overview map to see all in-transit trucks at a glance",
        "Customer opens tracking link in browser to see live map and ETA — no app needed",
        "Driver uses mobile interface to record arrival, start trip, and confirm delivery with OTP",
        "Admin views trip detail with timeline, GPS trail, and delivery confirmation",
      ],
    },
  },
  {
    id: 11,
    title: "Warehouse Management",
    subtitle: "Zone-Based Inventory & Cargo Tracking",
    icon: Warehouse,
    color: "from-yellow-700 to-yellow-500",
    department: "Warehouse Team",
    content: {
      description:
        "Track cargo across warehouse zones, manage storage allocation, monitor aging inventory, and coordinate cargo release with customs and delivery teams.",
      features: [
        "Zone-based storage management with occupancy tracking",
        "Cargo receiving and tallying with condition reporting",
        "Aging inventory alerts: 0–7, 8–14, 15–30, 30+ days",
        "Storage charge calculation based on days and rates",
        "Cargo release coordination with customs clearance status",
        "Damage reporting with photo documentation",
        "Search by BL number, container, or client name",
      ],
      useCases: [
        "Receive cargo into warehouse and assign to a storage zone",
        "Monitor aging cargo to prioritize clearance and avoid extra charges",
        "Coordinate release of cleared cargo for customer pickup or delivery",
        "Generate storage invoices based on days occupied",
      ],
    },
  },
  {
    id: 12,
    title: "Finance Module",
    subtitle: "Invoicing, Expenses & Tax Compliance",
    icon: DollarSign,
    color: "from-green-600 to-green-400",
    department: "Finance & Accounts Team",
    content: {
      description:
        "Complete financial management including invoicing, expense tracking, office accounts, bank integration, and GRA tax filing compliance.",
      features: [
        "Customer invoice generation with GHS formatting and multi-currency support",
        "Multiple office accounts: Bank, Petty Cash, Mobile Money",
        "Expense tracking with approval workflows",
        "Tax filing management: VAT, PAYE, Corporate Tax",
        "Outstanding balance and receivables tracking with aging analysis",
        "Job costing and profit & loss dashboard",
        "Bank integration with automated reconciliation and alerts",
        "Exchange rate management for USD/GHS conversions",
      ],
      useCases: [
        "Generate invoices for cleared shipments and send to clients",
        "Approve and process expense requests with category tracking",
        "Reconcile bank accounts with system records",
        "Prepare and track GRA tax submissions",
        "Monitor aged receivables and escalate overdue accounts",
      ],
    },
  },
  {
    id: 13,
    title: "SLAC AI Duty Estimator",
    subtitle: "Ghana Import Duty & Tax Calculator (GHS)",
    icon: Calculator,
    color: "from-orange-600 to-orange-400",
    department: "Customs & Finance",
    content: {
      description:
        "The SLAC AI Duty Estimator is an AI-powered import duty calculator tailored for Ghana customs (ICUMS) logic. Supports general cargo, vehicles, consolidated LCL, and air freight — with built-in exchange rate entry and all final estimates displayed in Ghana Cedis (GHS).",
      features: [
        "AI-driven HS code suggestion based on product description with confidence scoring",
        "Supports all cargo types: General, Vehicle (with engine capacity/age), LCL, Air Freight",
        "Full Ghana levy breakdown: Import Duty, VAT (15%), NHIL (2.5%), GETFund (2.5%), ECOWAS (0.5%), AU (0.2%), EXIM (0.75%), Processing Fee (1%)",
        "CIF value calculation with separate Cost, Insurance, and Freight inputs",
        "Exchange rate input section — enter current USD/GHS rate for real-time conversion",
        "All final duty payable amounts displayed in Ghana Cedis (GHS)",
        "Duty band detection: 0%, 5%, 10%, 20%, 35% based on HS classification",
        "Misclassification detection and cost-saving recommendations",
        "Step-by-step transparent calculation breakdown with GHS equivalents",
        "Export estimate to PDF for client quotations",
        "Disclaimer: Estimates are indicative — final duty per customs assessment",
      ],
      useCases: [
        "Client asks 'How much duty on electronics from China?' → enter description, get instant GHS estimate",
        "Enter exchange rate and CIF value → see total duty payable in Ghana Cedis immediately",
        "Calculate vehicle import duty with engine capacity and age-based depreciation",
        "Generate a duty estimate PDF with GHS amounts to attach to a client quotation",
        "Compare duty rates across different HS codes to find the most accurate classification",
        "Estimate total landed cost for a consolidated LCL shipment",
      ],
    },
  },
  {
    id: 14,
    title: "AI Operations Assistant",
    subtitle: "Intelligent Logistics Co-Pilot",
    icon: Bot,
    color: "from-violet-600 to-violet-400",
    department: "All Departments",
    content: {
      description:
        "A fully intelligent operations and knowledge assistant powered by advanced AI models with real-time access to company data. It understands natural language, queries live databases, generates documents, and provides actionable insights.",
      features: [
        "Natural Language Queries: Ask in plain English — 'Show containers arriving this week'",
        "Live Data Access: Queries consignments, invoices, consolidations, trucking trips, customers in real-time",
        "Smart Document Generation: Quotations, cargo reports, customs checklists, client emails, executive summaries",
        "Ghana Logistics Knowledge Base: Import procedures, HS codes, duty structure, ICUMS processes",
        "Department-Aware Context: Tailors responses based on user's department",
        "AI Document Reader: Upload BL, invoices, packing lists to auto-extract and populate forms",
        "Conversation Memory: Maintains context within sessions for follow-up queries",
        "All AI interactions logged in audit trail for compliance",
      ],
      useCases: [
        "Ask: 'Show containers arriving this week' → AI queries live data and presents a table",
        "Ask: 'Generate cargo status report for client ABC' → AI creates a document instantly",
        "Ask: 'Which shipments are close to demurrage?' → AI flags at-risk containers",
        "Ask: 'Summarize outstanding invoices over 30 days' → AI provides aging analysis",
        "Upload a Bill of Lading photo → AI extracts data and auto-fills the consignment form",
      ],
    },
  },
  {
    id: 15,
    title: "Customer Management",
    subtitle: "Client Records, Contacts & Documents",
    icon: Users,
    color: "from-rose-600 to-rose-400",
    department: "Sales & Customer Service",
    content: {
      description:
        "Maintain comprehensive customer records including company details, contacts, documents, credit management, and shipment history for all clients managed by SLAC.",
      features: [
        "Customer directory with search, filtering, and status tracking",
        "Company details: TIN Number, Registration, Industry, Trade Name",
        "Contact management with multiple persons per company",
        "Document tracking: Certificates, Licenses, Contracts with expiry alerts",
        "Credit limit management and outstanding balance monitoring",
        "Warehouse destination preferences per customer",
        "Customer code generation for internal reference",
      ],
      useCases: [
        "Onboard new customers with complete documentation and credit terms",
        "Verify customer compliance before processing shipments",
        "Monitor credit exposure and outstanding balances per client",
        "Track document renewals and send expiry reminders",
      ],
    },
  },
  {
    id: 16,
    title: "Client Self-Service Portal",
    subtitle: "Secure External Portal for Clients",
    icon: Plane,
    color: "from-indigo-600 to-indigo-400",
    department: "Sales & Customer Service",
    content: {
      description:
        "A secure, branded external portal at /portal/login that allows SLAC clients to independently track shipments, view documents, check invoices, and communicate with the SLAC team — without needing internal system access.",
      features: [
        "Secure login isolated from internal staff accounts",
        "Dashboard with live counts: Active Shipments, Documents, Invoices, Unread Messages",
        "Shipment Tracking: BL/container/vessel search with real-time status badges",
        "Documents & SOPs: View and securely download shipping documents",
        "Invoices & Payments: Outstanding balance summary, invoice history, payment status",
        "Real-time Messaging: Direct chat with SLAC team with instant delivery",
        "Row-Level Security: Each client sees only their own company's data",
      ],
      useCases: [
        "Client logs in to track their shipment ETA without calling SLAC",
        "Client downloads their Bill of Lading from the documents section",
        "Client checks outstanding invoices and payment due dates",
        "Client sends a message requesting an update on a held container",
        "Staff creates a client portal account from Admin → User Management",
      ],
    },
  },
  {
    id: 17,
    title: "Notifications & Alerts",
    subtitle: "Automated Real-Time Alert Engine",
    icon: Bell,
    color: "from-orange-500 to-orange-300",
    department: "All Departments",
    content: {
      description:
        "An automated alerts engine that scans the database every 15 minutes for overdue invoices, demurrage risks, stalled workflows, and aged receivables — delivering real-time notifications via the top bar bell icon.",
      features: [
        "Automated alert generation: Overdue invoices, demurrage past free time, expiring free days (3-day window)",
        "Stalled workflow detection: Consignments stuck at the same stage for over 48 hours",
        "Aged receivables warnings: Invoices outstanding over 60 days",
        "Real-time notification bell with unread count in the top navigation bar",
        "Live updates via Realtime subscription — no page refresh needed",
        "Deduplication logic prevents duplicate alerts within a 24-hour period",
        "Priority tagging: Critical, High, Medium, Low",
        "Quick preview dropdown showing the 5 most recent alerts",
        "Bulk actions: Mark all read, dismiss, resolve",
      ],
      useCases: [
        "Accounts team sees instant alert when an invoice passes its due date",
        "Operations team is warned 3 days before container free time expires",
        "Management receives alerts for consignments stuck in workflow over 48 hours",
        "Finance team gets notified of receivables aging past 60 days",
      ],
    },
  },
  {
    id: 18,
    title: "Reports & Analytics",
    subtitle: "Business Intelligence Across All Departments",
    icon: BarChart3,
    color: "from-cyan-600 to-cyan-400",
    department: "Management",
    content: {
      description:
        "A comprehensive reports and analytics module delivering real-time, filterable, and exportable business intelligence across Operations, Finance, Warehouse, and Client dimensions.",
      features: [
        "Management Tab: KPI summary cards, revenue vs expense trends, AI executive summary",
        "Operations Tab: Shipment volume by type, BL/AWB tracking, status distribution",
        "Finance Tab: Revenue report, outstanding invoices, net cash position, expense analysis",
        "Warehouse Tab: Zone occupancy utilization, cargo aging breakdown",
        "Clients Tab: Profitability table, credit exposure, active vs inactive clients",
        "Role-based tab visibility — each department sees relevant reports only",
        "Export options: CSV, Excel, PDF",
      ],
      useCases: [
        "Management monthly review: Open Management tab and review KPI cards",
        "Finance audit: Filter by date range and export outstanding invoices to Excel",
        "Warehouse planning: Check occupancy utilization and identify aging cargo",
        "Client review: Identify top revenue clients and high credit-risk accounts",
      ],
    },
  },
  {
    id: 19,
    title: "Office Files Portal",
    subtitle: "Secure Archive, Document Scanning & Storage",
    icon: FolderArchive,
    color: "from-slate-700 to-slate-500",
    department: "All Departments",
    content: {
      description:
        "A permanent, secure digital archive for all finalized shipment documents with built-in document scanning. Once a consignment is marked 'Completed', its record and documents become read-only — only Super Admins can edit or delete locked files.",
      features: [
        "Document Scanner: Scan and upload physical documents directly from the portal",
        "Auto-generated Consignment ID with BL/AWB, container numbers, and client details",
        "Mandatory document checklist across 5 categories: Customs, Shipping Line, Company Financial, Warehouse, and Shipping",
        "Drag & drop multi-file upload with automatic timestamps and uploader tracking",
        "Document version history — upload new versions while preserving previous ones",
        "PDF preview for uploaded documents directly in the portal",
        "Full audit log tracking every view, download, and upload action",
        "Financial outcome summary: auto-calculated Revenue vs. Expenses per consignment",
        "Search by BL, AWB, container number, or client name",
        "Role-based access: Staff can view/upload, Admins can edit, Super Admins can delete",
      ],
      useCases: [
        "Scan physical documents (receipts, customs forms) and save them to a consignment",
        "Archive a completed consignment with all customs and financial documents",
        "Verify all required documents are uploaded before marking complete",
        "Search for a past consignment by BL number to retrieve documents",
        "Review the financial outcome of a job — revenue vs. expenses",
        "Audit who downloaded or viewed a specific document and when",
      ],
    },
  },
  {
    id: 20,
    title: "Media Hub",
    subtitle: "Industry News & Company Updates",
    icon: Newspaper,
    color: "from-pink-600 to-pink-400",
    department: "All Users (Public)",
    content: {
      description:
        "A public-facing media hub for publishing industry news, company announcements, and logistics insights. Accessible without login at /media-hub.",
      features: [
        "Publish articles with rich text content and featured images",
        "Categorize articles by topic: Industry News, Company Updates, Logistics Insights",
        "Public access — no login required for readers",
        "Admin media management for creating, editing, and publishing articles",
        "SEO-friendly article URLs with slug-based routing",
      ],
      useCases: [
        "Publish a company announcement about new service routes",
        "Share industry news about customs regulation changes",
        "Highlight logistics insights and operational best practices",
      ],
    },
  },
  {
    id: 21,
    title: "Admin & Security",
    subtitle: "User Management, Roles & Audit Trails",
    icon: ShieldCheck,
    color: "from-gray-700 to-gray-500",
    department: "Super Admin / Admin",
    content: {
      description:
        "Manage staff accounts, assign roles and departments, configure system settings, and maintain full audit trails across the platform. Security features include account locking, inactivity timeouts, and role-based access control.",
      features: [
        "User account creation with role assignment: Super Admin, Admin, Manager, Staff",
        "Department assignment: Operations, Documentation, Accounts, Management, Warehouse, Customer Service",
        "Client portal account creation and management",
        "Account locking after 5 failed login attempts",
        "1-minute staff inactivity timeout with 'Session expired' warning and auto-logout",
        "Force password change on first login",
        "Complete audit log of all system mutations",
        "Role-based menu visibility and feature access",
        "Staff profile management with department and contact info",
      ],
      useCases: [
        "Create a new staff account and assign to the Operations department",
        "Create a client portal account linked to a customer company",
        "Review audit logs to investigate a data discrepancy",
        "Unlock a staff account after too many failed login attempts",
        "Assign admin privileges to a trusted manager",
      ],
    },
  },
  {
    id: 22,
    title: "Getting Started",
    subtitle: "Quick Start Guide for Your Team",
    icon: CheckCircle,
    color: "from-teal-600 to-teal-400",
    content: {
      description:
        "Follow these steps to get your team up and running with SLAC Operations quickly and efficiently.",
      features: [
        "Step 1: Admin sets up staff user accounts with appropriate department access",
        "Step 2: Admin creates client portal accounts for each customer company",
        "Step 3: Import existing customer data and shipping documentation",
        "Step 4: Configure office accounts and financial settings in Finance",
        "Step 5: Add fleet vehicles and driver profiles in the Trucking module",
        "Step 6: Create trips and activate live tracking — share links via WhatsApp",
        "Step 7: Start creating consignments and tracking workflows in real time",
        "Step 8: Use the SLAC AI Duty Estimator for quick customs duty quotes in GHS",
        "Step 9: Share client portal login link with customers for self-service access",
      ],
      useCases: [
        "Use the Notifications bell to stay on top of automated alerts",
        "Activate live tracking on trips and share links with customers instantly",
        "Visit Reports & Analytics for weekly management reviews",
        "Use the AI Assistant for quick answers without searching manually",
        "Use the Duty Estimator for instant GHS duty estimates",
        "Bookmark the Client Portal link to share with new customers",
      ],
    },
  },
];

export default function Presentation() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const slide = slides[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Ship className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">SLAC Operations</h1>
              <p className="text-sm text-muted-foreground">Software Guide & Training</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Slide {currentSlide + 1} of {slides.length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Slide Content */}
        <Card className="overflow-hidden">
          <div className={cn("bg-gradient-to-r p-8 text-white", slide.color)}>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <Icon className="h-8 w-8" />
              </div>
              <div>
                {slide.department && (
                  <Badge variant="secondary" className="mb-2 bg-white/20 text-white hover:bg-white/30">
                    {slide.department}
                  </Badge>
                )}
                <h2 className="text-3xl font-bold">{slide.title}</h2>
                <p className="text-lg text-white/80">{slide.subtitle}</p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Description & Features */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Overview</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {slide.content.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                  <ul className="space-y-2">
                    {slide.content.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Use Cases */}
              {slide.content.useCases && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">How to Use</h3>
                  <div className="space-y-3">
                    {slide.content.useCases.map((useCase, index) => (
                      <Card key={index} className="bg-muted/50">
                        <CardContent className="p-4 flex items-start gap-3">
                          <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{useCase}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {/* Slide Indicators */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center max-w-md">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentSlide
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Quick Navigation</h3>
          <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-11 gap-2">
            {slides.map((s, index) => {
              const SlideIcon = s.icon;
              return (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "flex flex-col items-center gap-2 p-3 rounded-lg border transition-all",
                    index === currentSlide
                      ? "border-primary bg-primary/5"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <SlideIcon className={cn(
                    "h-5 w-5",
                    index === currentSlide ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className={cn(
                    "text-xs text-center line-clamp-2",
                    index === currentSlide ? "text-primary font-medium" : "text-muted-foreground"
                  )}>
                    {s.title.split(" ").slice(0, 2).join(" ")}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
