import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BookOpen, Search, Users, FileText, Ship, DollarSign, Truck, UserCircle,
  Workflow, AlertTriangle, CheckCircle2, Lightbulb, Smartphone, Shield,
  LayoutDashboard, Upload, Receipt, MapPin,
} from "lucide-react";

type Section = {
  id: string;
  title: string;
  icon: React.ElementType;
  group: string;
  body: React.ReactNode;
  keywords: string;
};

const Step = ({ n, children }: { n: number; children: React.ReactNode }) => (
  <li className="flex gap-3 py-1.5">
    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center justify-center">
      {n}
    </span>
    <span className="text-sm text-foreground/90 leading-relaxed">{children}</span>
  </li>
);

const Tip = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2 p-3 rounded-md bg-primary/5 border border-primary/20 my-2">
    <Lightbulb className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
    <p className="text-sm text-foreground/80">{children}</p>
  </div>
);

const Warn = ({ children }: { children: React.ReactNode }) => (
  <div className="flex gap-2 p-3 rounded-md bg-destructive/5 border border-destructive/20 my-2">
    <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
    <p className="text-sm text-foreground/80">{children}</p>
  </div>
);

const ScreenMock = ({ label, hint }: { label: string; hint: string }) => (
  <div className="my-3 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center">
    <LayoutDashboard className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
    <p className="text-sm font-medium text-foreground">{label}</p>
    <p className="text-xs text-muted-foreground mt-1">{hint}</p>
  </div>
);

const sections: Section[] = [
  {
    id: "intro",
    group: "Getting Started",
    title: "1. Introduction",
    icon: BookOpen,
    keywords: "introduction welcome about shipperslink slac",
    body: (
      <div className="space-y-3 text-sm">
        <p>Welcome to <strong>ShippersLink 360</strong> — the all-in-one logistics platform used by Shippers Link Agencies Co., Ltd (SLAC) to manage clients, shipments, documents, accounts, trucking and client communication in real time.</p>
        <p>This guide is written in plain English so that any new staff member can use the system on day one. Each section walks you through what to do, when to do it, and how to do it correctly.</p>
        <Tip>If you ever get lost, click <strong>User Guide</strong> in the left sidebar to come back here, or use the search bar at the top of this page.</Tip>
      </div>
    ),
  },
  {
    id: "overview",
    group: "Getting Started",
    title: "2. System Overview",
    icon: Workflow,
    keywords: "overview big picture how system works flow",
    body: (
      <div className="space-y-3 text-sm">
        <p>The platform connects every department so information entered once flows everywhere automatically.</p>
        <div className="rounded-lg border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Standard flow</p>
          <p className="font-mono text-xs leading-relaxed">
            Client → Consignment → Documents → Clearance → Payment → Delivery → Tracking
          </p>
        </div>
        <p>Every action you take updates dashboards across Operations, Documentation, Accounts and the Client Portal instantly — <strong>no manual refresh required</strong>.</p>
      </div>
    ),
  },
  {
    id: "roles",
    group: "Getting Started",
    title: "3. User Roles & Access",
    icon: Shield,
    keywords: "roles permissions admin operations documentation accounts trucking driver client",
    body: (
      <div className="space-y-3 text-sm">
        <p>Each user sees only the modules they need. Your department is set by the Admin when your account is created.</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { role: "Admin / Management", access: "Full access to all modules", duty: "Configure users, oversee operations, view all reports" },
            { role: "Operations", access: "Shipments, Consignments, Port Command, Trucking", duty: "Create & update shipments, manage workflow stages" },
            { role: "Documentation", access: "Shipments, ICUMS, Shipping Lines, GPHA", duty: "Upload BL/AWB, process clearance, manage docs" },
            { role: "Accounts", access: "Finance, Invoicing, Payments, Banking, Books", duty: "Issue invoices, record payments, reconcile bank" },
            { role: "Trucking / Driver", access: "Driver app, assigned trips, POD capture", duty: "Start trips, share GPS, deliver & confirm" },
            { role: "Client", access: "Client Portal only — their own data", duty: "View shipments, download docs, pay invoices" },
          ].map((r) => (
            <div key={r.role} className="rounded-lg border bg-card p-3">
              <p className="font-semibold text-sm">{r.role}</p>
              <p className="text-xs text-muted-foreground mt-1"><strong>Access:</strong> {r.access}</p>
              <p className="text-xs text-muted-foreground mt-1"><strong>Responsible for:</strong> {r.duty}</p>
            </div>
          ))}
        </div>
        <Warn>If you cannot see a menu item you need, contact your Admin — your role may need to be adjusted.</Warn>
      </div>
    ),
  },
  {
    id: "client-mgmt",
    group: "Modules",
    title: "4.1 Client Management",
    icon: Users,
    keywords: "client customer create add new update profile",
    body: (
      <div className="space-y-3 text-sm">
        <p>Used by: <Badge variant="secondary">Admin</Badge> <Badge variant="secondary">Accounts</Badge> <Badge variant="secondary">Operations</Badge></p>
        <h4 className="font-semibold">How to create a new client</h4>
        <ol className="space-y-1">
          <Step n={1}>From the sidebar, open <strong>Customers</strong>.</Step>
          <Step n={2}>Click the <strong>+ New Customer</strong> button (top right).</Step>
          <Step n={3}>Fill in company name, contact person, email and phone. The Customer ID is generated automatically.</Step>
          <Step n={4}>Click <strong>Save</strong>. The client is now available everywhere in the system.</Step>
        </ol>
        <h4 className="font-semibold pt-2">How to update a client</h4>
        <ol className="space-y-1">
          <Step n={1}>Search the client by name in the Customers list.</Step>
          <Step n={2}>Click the row → edit the fields → <strong>Save</strong>.</Step>
        </ol>
        <ScreenMock label="Customers screen" hint="Use the search box at the top to find any client in seconds." />
      </div>
    ),
  },
  {
    id: "documentation",
    group: "Modules",
    title: "4.2 Documentation",
    icon: FileText,
    keywords: "documents upload bl awb scan ai",
    body: (
      <div className="space-y-3 text-sm">
        <p>Used by: <Badge variant="secondary">Documentation</Badge> <Badge variant="secondary">Operations</Badge></p>
        <h4 className="font-semibold">How to upload a document</h4>
        <ol className="space-y-1">
          <Step n={1}>Open <strong>Shipments</strong> or <strong>Consignments</strong> and click the shipment you want.</Step>
          <Step n={2}>Go to the <strong>Documents</strong> tab → click <strong>Upload</strong>.</Step>
          <Step n={3}>Drop your PDF or photo of the BL/AWB. The AI scanner can auto-read fields like BL number, container, vessel.</Step>
          <Step n={4}>Confirm the suggested values, then click <strong>Save</strong>.</Step>
        </ol>
        <Tip>Always upload documents the moment you receive them — the client portal updates instantly so customers can see them.</Tip>
        <h4 className="font-semibold pt-2">Tagging with client & consignment</h4>
        <p>Tagging is automatic when you upload from inside a shipment. To attach an existing file, use <strong>Office Files</strong> → choose the client and shipment from the dropdowns.</p>
      </div>
    ),
  },
  {
    id: "operations",
    group: "Modules",
    title: "4.3 Operations",
    icon: Ship,
    keywords: "operations consignment shipment create stage workflow",
    body: (
      <div className="space-y-3 text-sm">
        <p>Used by: <Badge variant="secondary">Operations</Badge> <Badge variant="secondary">Documentation</Badge></p>
        <h4 className="font-semibold">How to create a consignment</h4>
        <ol className="space-y-1">
          <Step n={1}>Sidebar → <strong>Consignments</strong> → <strong>+ New Consignment</strong>.</Step>
          <Step n={2}>Pick the client, shipment type (Sea / Air), and enter BL/AWB number.</Step>
          <Step n={3}>Add container numbers separated by commas, and the officer in charge.</Step>
          <Step n={4}>Click <strong>Save</strong>. The 9-stage workflow starts automatically.</Step>
        </ol>
        <h4 className="font-semibold pt-2">How to update shipment status</h4>
        <ol className="space-y-1">
          <Step n={1}>Open the consignment → click the current <strong>Stage</strong> badge.</Step>
          <Step n={2}>Pick the next stage (e.g. <em>Cleared</em>, <em>Delivery</em>).</Step>
          <Step n={3}>Add a short note if needed → <strong>Confirm</strong>. The client and Accounts are notified.</Step>
        </ol>
        <Warn>Always move the stage forward as soon as it happens in real life. Late updates trigger SLA alerts.</Warn>
      </div>
    ),
  },
  {
    id: "accounts",
    group: "Modules",
    title: "4.4 Accounts",
    icon: DollarSign,
    keywords: "accounts finance invoice payment statement voucher ledger",
    body: (
      <div className="space-y-3 text-sm">
        <p>Used by: <Badge variant="secondary">Accounts</Badge> <Badge variant="secondary">Management</Badge></p>
        <h4 className="font-semibold">Create an invoice</h4>
        <ol className="space-y-1">
          <Step n={1}>Sidebar → <strong>Accounts → Books</strong> → tab <strong>Invoices</strong> → <strong>+ New Invoice</strong>.</Step>
          <Step n={2}>Choose the client and link the consignment (auto-pulls cargo details).</Step>
          <Step n={3}>Add line items: description, currency, amount. Tax is calculated automatically.</Step>
          <Step n={4}>Click <strong>Issue</strong> — the client receives it instantly in their portal.</Step>
        </ol>
        <h4 className="font-semibold pt-2">Record a payment</h4>
        <ol className="space-y-1">
          <Step n={1}>Open the invoice → <strong>Record Payment</strong>.</Step>
          <Step n={2}>Enter amount, date, method (bank, cash, mobile money) and reference.</Step>
          <Step n={3}>Save. The invoice status flips to <em>Paid</em> or <em>Partially Paid</em>.</Step>
        </ol>
        <h4 className="font-semibold pt-2">Generate a statement</h4>
        <ol className="space-y-1">
          <Step n={1}>Open the client in <strong>Customers</strong> → <strong>Statement</strong> tab.</Step>
          <Step n={2}>Pick a date range → <strong>Export CSV / PDF</strong>.</Step>
        </ol>
      </div>
    ),
  },
  {
    id: "trucking",
    group: "Modules",
    title: "4.5 Trucking",
    icon: Truck,
    keywords: "trucking trip driver truck assign route delivery pod",
    body: (
      <div className="space-y-3 text-sm">
        <p>Used by: <Badge variant="secondary">Operations</Badge> <Badge variant="secondary">Warehouse</Badge> <Badge variant="secondary">Driver</Badge></p>
        <h4 className="font-semibold">Create a trip</h4>
        <ol className="space-y-1">
          <Step n={1}>Sidebar → <strong>Trucking</strong> → <strong>+ New Trip</strong>.</Step>
          <Step n={2}>Pick the truck, driver, container, origin and destination.</Step>
          <Step n={3}>Save — the driver instantly sees the trip on their phone.</Step>
        </ol>
        <h4 className="font-semibold pt-2">Assign / change driver</h4>
        <p>Open the trip → click the driver name → choose another active driver.</p>
        <h4 className="font-semibold pt-2">How tracking works</h4>
        <ol className="space-y-1">
          <Step n={1}>Driver taps <strong>Start Trip</strong> on the mobile app — GPS sharing begins.</Step>
          <Step n={2}>The map on <strong>Live Tracking</strong> updates every few seconds.</Step>
          <Step n={3}>At destination, driver captures customer OTP or signature → trip marked <em>Delivered</em>.</Step>
          <Step n={4}>Mark <strong>Completed</strong> — expenses auto-post to Accounts.</Step>
        </ol>
      </div>
    ),
  },
  {
    id: "client-portal",
    group: "Modules",
    title: "4.6 Client Portal",
    icon: UserCircle,
    keywords: "client portal login download invoice payment track",
    body: (
      <div className="space-y-3 text-sm">
        <p>Clients access their own portal at <code className="px-1.5 py-0.5 rounded bg-muted text-xs">/portal/login</code>.</p>
        <h4 className="font-semibold">How a client logs in</h4>
        <ol className="space-y-1">
          <Step n={1}>Visit the portal URL → enter the email + password sent by Admin.</Step>
          <Step n={2}>First-time users will be asked to change their password.</Step>
        </ol>
        <h4 className="font-semibold pt-2">Download documents</h4>
        <p>Click <strong>Documents</strong> in the portal sidebar → click any file to download (secure signed link).</p>
        <h4 className="font-semibold pt-2">View financials</h4>
        <p><strong>Financials</strong> tab shows all invoices, balance and payment history. Click any invoice to view or pay online.</p>
        <h4 className="font-semibold pt-2">Track delivery</h4>
        <p><strong>Shipments</strong> tab shows live stages, ETA and a map of the truck when on the road.</p>
      </div>
    ),
  },
  {
    id: "e2e",
    group: "Workflow",
    title: "5. End-to-End Workflow",
    icon: Workflow,
    keywords: "end to end workflow full process",
    body: (
      <div className="space-y-2 text-sm">
        <p>The full lifecycle of a shipment, from sign-up to completion:</p>
        <ol className="space-y-1">
          {[
            "Create the client in Customers.",
            "Create the consignment in Consignments (link to the client).",
            "Upload the BL/AWB & supporting docs in Documents.",
            "Process clearance through ICUMS / GPHA / Shipping Lines.",
            "Issue the invoice in Accounts → Books.",
            "Receive the payment and record it on the invoice.",
            "Release cargo — workflow stage moves to Released.",
            "Create a trucking trip and assign driver + truck.",
            "Track delivery live on the map until POD captured.",
            "Mark trip & consignment as Completed — file is archived automatically.",
          ].map((s, i) => <Step key={i} n={i + 1}>{s}</Step>)}
        </ol>
      </div>
    ),
  },
  {
    id: "visuals",
    group: "Workflow",
    title: "6. Visual Guide",
    icon: LayoutDashboard,
    keywords: "screenshots visual dashboard upload invoice tracking",
    body: (
      <div className="space-y-3 text-sm">
        <p>Where to find each key screen:</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-lg border bg-card p-3">
            <LayoutDashboard className="h-5 w-5 text-primary mb-1" />
            <p className="font-semibold text-sm">Dashboard</p>
            <p className="text-xs text-muted-foreground">Sidebar → Dashboard. Live KPIs and activity feed.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <Upload className="h-5 w-5 text-primary mb-1" />
            <p className="font-semibold text-sm">Upload screen</p>
            <p className="text-xs text-muted-foreground">Inside any shipment → Documents tab → Upload.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <Receipt className="h-5 w-5 text-primary mb-1" />
            <p className="font-semibold text-sm">Invoice screen</p>
            <p className="text-xs text-muted-foreground">Accounts → Books → Invoices.</p>
          </div>
          <div className="rounded-lg border bg-card p-3">
            <MapPin className="h-5 w-5 text-primary mb-1" />
            <p className="font-semibold text-sm">Tracking page</p>
            <p className="text-xs text-muted-foreground">Sidebar → Live Tracking. Map auto-refreshes.</p>
          </div>
        </div>
        <Tip>Press <kbd className="px-1.5 py-0.5 rounded border bg-muted text-xs">Ctrl/⌘ + K</kbd> in any list to jump straight to search.</Tip>
      </div>
    ),
  },
  {
    id: "trouble",
    group: "Support",
    title: "7. Troubleshooting",
    icon: AlertTriangle,
    keywords: "troubleshooting errors fix problem help",
    body: (
      <div className="space-y-2 text-sm">
        {[
          { issue: "Document not showing on client portal", cause: "Wrong Client ID linked", fix: "Open the file in Office Files → re-tag with correct client." },
          { issue: "Tracking not updating", cause: "Driver GPS off or no signal", fix: "Driver enables Location in phone settings & re-opens the app." },
          { issue: "Cannot create invoice", cause: "Consignment not linked to a client", fix: "Open the consignment and pick the client first." },
          { issue: "Payment not reflecting", cause: "Currency mismatch", fix: "Confirm payment currency matches the invoice currency." },
          { issue: "Locked out after wrong password", cause: "5 failed attempts triggered auto-lock", fix: "Wait 5 mins or ask Admin to unlock the account." },
          { issue: "Menu item missing", cause: "Department permission not granted", fix: "Ask Admin to update your role." },
        ].map((t) => (
          <div key={t.issue} className="rounded-lg border bg-card p-3">
            <p className="font-semibold text-sm">{t.issue}</p>
            <p className="text-xs text-muted-foreground mt-1"><strong>Cause:</strong> {t.cause}</p>
            <p className="text-xs text-foreground/80 mt-1"><strong>Fix:</strong> {t.fix}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "best",
    group: "Support",
    title: "8. Best Practices",
    icon: CheckCircle2,
    keywords: "best practices guidelines tips",
    body: (
      <ul className="space-y-2 text-sm">
        {[
          "Always link data correctly — client → consignment → documents → invoice.",
          "Upload documents immediately when received, never end-of-day.",
          "Update workflow stages in real time so other departments stay in sync.",
          "Search before creating — avoid duplicate clients or shipments.",
          "Use the AI Document Scanner to reduce typing errors.",
          "Close completed trips so accounting can post expenses cleanly.",
        ].map((b) => (
          <li key={b} className="flex gap-2">
            <CheckCircle2 className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
            <span>{b}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "tips",
    group: "Support",
    title: "9. System Tips",
    icon: Lightbulb,
    keywords: "tips shortcuts filter search notifications",
    body: (
      <ul className="space-y-2 text-sm">
        <li>• Use the <strong>filters</strong> at the top of every list to narrow records instantly.</li>
        <li>• Use the <strong>search bar</strong> instead of scrolling through pages.</li>
        <li>• Check the <strong>bell icon</strong> daily — overdue tasks and SLA alerts appear there.</li>
        <li>• The dashboard <strong>Live Activity Feed</strong> shows what other departments are doing right now.</li>
        <li>• Export anything to CSV using the <strong>Export</strong> button on lists.</li>
      </ul>
    ),
  },
  {
    id: "mobile",
    group: "Other",
    title: "10. Mobile Usage",
    icon: Smartphone,
    keywords: "mobile phone driver client app",
    body: (
      <div className="space-y-3 text-sm">
        <p>The system is fully mobile-friendly — no app install needed.</p>
        <h4 className="font-semibold">Drivers</h4>
        <ol className="space-y-1">
          <Step n={1}>Open the portal link in Chrome / Safari on the phone.</Step>
          <Step n={2}>Log in → see assigned trips → tap <strong>Start Trip</strong>.</Step>
          <Step n={3}>Allow Location access so head office sees you live.</Step>
          <Step n={4}>At destination, capture OTP or signature → tap <strong>Confirm Delivery</strong>.</Step>
        </ol>
        <h4 className="font-semibold pt-2">Clients</h4>
        <p>Clients log in at the same portal URL on their phone. The layout adapts automatically — they can view shipments, download docs and pay invoices on mobile.</p>
        <Tip>Add the portal to your home screen: Browser menu → <em>Add to Home Screen</em>. It opens like an app.</Tip>
      </div>
    ),
  },
  {
    id: "security",
    group: "Other",
    title: "11. Security Awareness",
    icon: Shield,
    keywords: "security password logout 2fa safety",
    body: (
      <ul className="space-y-2 text-sm">
        <li>• <strong>Never share</strong> your username or password — every action is logged under your account.</li>
        <li>• Always <strong>log out</strong> when you leave the computer. The system also auto-logs out after 5 minutes of inactivity.</li>
        <li>• Use a <strong>strong password</strong> (8+ characters, mix of letters, numbers and symbols).</li>
        <li>• Email <strong>2FA</strong> may be required for sensitive logins — check your inbox for the code.</li>
        <li>• Report suspicious activity to Admin immediately.</li>
      </ul>
    ),
  },
];

const groups = ["Getting Started", "Modules", "Workflow", "Support", "Other"];

export default function UserGuide() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.keywords.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">User Guide</h1>
            <p className="text-sm text-muted-foreground">
              Step-by-step manual for every module of ShippersLink 360.
            </p>
          </div>
        </div>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search the guide... (e.g. invoice, trip, upload)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* TOC */}
        <aside className="hidden lg:block">
          <Card className="sticky top-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Contents</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[70vh]">
                <nav className="p-2 space-y-3">
                  {groups.map((g) => {
                    const items = filtered.filter((s) => s.group === g);
                    if (!items.length) return null;
                    return (
                      <div key={g}>
                        <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{g}</p>
                        {items.map((s) => (
                          <a
                            key={s.id}
                            href={`#${s.id}`}
                            className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-foreground/80 hover:bg-muted hover:text-foreground"
                          >
                            <s.icon className="h-3.5 w-3.5" />
                            <span className="truncate">{s.title}</span>
                          </a>
                        ))}
                      </div>
                    );
                  })}
                </nav>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Content */}
        <div className="space-y-4">
          {filtered.length === 0 && (
            <Card><CardContent className="p-6 text-center text-sm text-muted-foreground">No sections match your search.</CardContent></Card>
          )}
          {groups.map((g) => {
            const items = filtered.filter((s) => s.group === g);
            if (!items.length) return null;
            return (
              <div key={g}>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-1">{g}</h2>
                <Accordion type="multiple" defaultValue={items.map((i) => i.id)} className="space-y-2">
                  {items.map((s) => (
                    <AccordionItem key={s.id} value={s.id} id={s.id} className="border rounded-lg bg-card scroll-mt-4">
                      <AccordionTrigger className="px-4 hover:no-underline">
                        <div className="flex items-center gap-3 text-left">
                          <s.icon className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="font-semibold text-sm">{s.title}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">{s.body}</AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
