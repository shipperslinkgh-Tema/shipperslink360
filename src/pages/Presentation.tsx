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
        "Fleet and driver management with trip scheduling",
        "Complete financial management with GHS currency support",
        "Customer relationship management with document tracking",
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
    id: 4,
    title: "Customs & Ports",
    subtitle: "ICUMS Declarations & Port Operations",
    icon: FileCheck,
    color: "from-amber-600 to-amber-400",
    department: "Customs & Clearing Team",
    content: {
      description:
        "Handle all customs-related activities including ICUMS declarations, shipping line DO management, and GPHA port status tracking.",
      features: [
        "ICUMS declaration submission and status tracking",
        "Duty calculations with tax breakdown (Import Duty, VAT, NHIL, etc.)",
        "Shipping line integration for Delivery Order management",
        "Demurrage tracking with free days monitoring",
        "GPHA port status and container location tracking",
      ],
      useCases: [
        "Submit new ICUMS declarations with HS codes",
        "Track declaration status: Draft → Submitted → Assessed → Paid → Released",
        "Monitor free days to avoid demurrage charges",
        "Coordinate container pickup with shipping lines",
      ],
    },
  },
  {
    id: 5,
    title: "Fleet & Logistics",
    subtitle: "Trucking & Warehouse Management",
    icon: Truck,
    color: "from-purple-600 to-purple-400",
    department: "Fleet & Logistics Team",
    content: {
      description:
        "Manage your truck fleet, driver assignments, trip scheduling, and warehouse operations for efficient cargo movement.",
      features: [
        "Truck fleet inventory with maintenance tracking",
        "Driver profiles with license and certification management",
        "Trip scheduling from port to customer locations",
        "Real-time trip status: Scheduled → Loading → In Transit → Delivered",
        "Warehouse inventory and storage management",
      ],
      useCases: [
        "Assign available trucks and drivers to new trips",
        "Track ongoing deliveries and update ETAs",
        "Schedule vehicle maintenance based on mileage",
        "Manage warehouse space and cargo storage",
      ],
    },
  },
  {
    id: 6,
    title: "Finance Module",
    subtitle: "Invoicing, Expenses & Tax Compliance",
    icon: DollarSign,
    color: "from-green-600 to-green-400",
    department: "Finance & Accounts Team",
    content: {
      description:
        "Complete financial management including invoicing, expense tracking, office accounts, and GRA tax filing compliance.",
      features: [
        "Customer invoice generation with GHS formatting",
        "Multiple office accounts: Bank, Petty Cash, Mobile Money",
        "Expense tracking with approval workflows",
        "Tax filing management: VAT, PAYE, Corporate Tax",
        "Outstanding balance and receivables tracking",
      ],
      useCases: [
        "Generate invoices for cleared shipments",
        "Approve and process expense requests",
        "Reconcile bank accounts with system records",
        "Prepare and track GRA tax submissions",
      ],
    },
  },
  {
    id: 7,
    title: "Customer Portal",
    subtitle: "Client Management & Documentation",
    icon: Users,
    color: "from-rose-600 to-rose-400",
    department: "Sales & Customer Service",
    content: {
      description:
        "Maintain comprehensive customer records including company details, contacts, documents, and shipment history.",
      features: [
        "Customer directory with search and filtering",
        "Company details: TIN Number, Registration, Industry",
        "Contact management with multiple persons per company",
        "Document tracking: Certificates, Licenses, Contracts",
        "Expiry alerts for compliance documents",
      ],
      useCases: [
        "Onboard new customers with complete documentation",
        "Verify customer compliance before processing shipments",
        "Update contact information and communication preferences",
        "Track document renewals and send reminders",
      ],
    },
  },
  {
    id: 8,
    title: "Reports & Analytics",
    subtitle: "Business Intelligence & Insights",
    icon: BarChart3,
    color: "from-cyan-600 to-cyan-400",
    department: "Management",
    content: {
      description:
        "Generate comprehensive reports and analytics to drive business decisions and monitor operational performance.",
      features: [
        "Shipment volume reports by period and type",
        "Revenue and expense analysis",
        "Customer performance and outstanding balances",
        "Fleet utilization and efficiency metrics",
        "Customs clearance time analysis",
      ],
      useCases: [
        "Monthly management review presentations",
        "Identify high-value customers and opportunities",
        "Analyze operational bottlenecks",
        "Budget planning and forecasting",
      ],
    },
  },
  {
    id: 9,
    title: "Getting Started",
    subtitle: "Quick Start Guide for Your Team",
    icon: CheckCircle,
    color: "from-indigo-600 to-indigo-400",
    content: {
      description:
        "Follow these steps to get your team up and running with SLAC Operations quickly and efficiently.",
      features: [
        "Step 1: Set up user accounts with appropriate department access",
        "Step 2: Import existing customer data and documentation",
        "Step 3: Configure office accounts and financial settings",
        "Step 4: Add fleet vehicles and driver information",
        "Step 5: Start creating shipments and tracking operations",
      ],
      useCases: [
        "Contact support for training sessions",
        "Use the notifications bell for system alerts",
        "Access settings for user preferences",
        "Bookmark frequently used pages for quick access",
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
          <div className="flex items-center gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  index === currentSlide
                    ? "w-8 bg-primary"
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
          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
            {slides.map((s, index) => {
              const SlideIcon = s.icon;
              return (
                <button
                  key={s.id}
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
