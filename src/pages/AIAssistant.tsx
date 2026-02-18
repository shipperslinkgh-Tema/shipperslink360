import { useState } from "react";
import { 
  Bot, Ship, FileText, DollarSign, BarChart3, MessageSquare, 
  Warehouse, Zap, Brain, Shield, Clock
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { useAuth } from "@/contexts/AuthContext";

const modules = [
  {
    id: "operations",
    label: "Operations",
    icon: Ship,
    color: "text-info",
    description: "Shipment analysis, BL/AWB interpretation, client updates",
    placeholder: "E.g. Analyze BL COSU123456789 and draft a client update...",
    welcome: `# Operations AI Assistant
I can help you with:
- **Shipment tracking** — analyze BL, AWB, container numbers
- **Client updates** — draft professional shipment status emails  
- **Document interpretation** — explain shipping documents
- **Customs procedures** — ICUMS references, port processes at Tema/Takoradi

What would you like to work on?`,
    departments: ["operations", "management", "super_admin"],
  },
  {
    id: "documentation",
    label: "Documentation",
    icon: FileText,
    color: "text-accent",
    description: "HS codes, document validation, customs declarations",
    placeholder: "E.g. Suggest HS code for electronic transformers used in industrial applications...",
    welcome: `# Documentation AI Assistant
I can help you with:
- **HS Code classification** — based on product descriptions (Ghana GRA tariff)
- **Document validation** — detect missing or inconsistent data in BL, packing lists
- **Customs declarations** — generate structured ICUMS declaration summaries
- **Compliance checks** — verify document completeness before filing

Describe a product or paste a document for analysis.`,
    departments: ["documentation", "operations", "management", "super_admin"],
  },
  {
    id: "finance",
    label: "Finance",
    icon: DollarSign,
    color: "text-success",
    description: "Invoice analysis, payment vouchers, anomaly detection",
    placeholder: "E.g. Generate a payment voucher draft for shipping line DO fee of $1,200...",
    welcome: `# Finance AI Assistant
I can help you with:
- **Invoice analysis** — review and validate invoice details
- **Payment voucher drafts** — generate structured payment requests
- **Financial summaries** — analyze revenue, costs, P&L
- **Anomaly detection** — flag unusual charges or billing discrepancies
- **Forex calculations** — GHS/USD/EUR conversions with current rates

What financial task can I assist with?`,
    departments: ["accounts", "management", "super_admin"],
  },
  {
    id: "management",
    label: "Management",
    icon: BarChart3,
    color: "text-warning",
    description: "KPI insights, performance summaries, demurrage risk",
    placeholder: "E.g. Summarize operational performance for February 2026 and highlight risks...",
    welcome: `# Management AI Assistant
I can help you with:
- **Performance summaries** — operational KPIs and trend analysis
- **Risk identification** — demurrage risk, delay patterns, bottlenecks
- **Report drafting** — board reports, management memos, department reviews
- **Strategic insights** — freight market trends in Ghana and West Africa
- **Staff productivity** — workload distribution and efficiency metrics

What management insight do you need?`,
    departments: ["management", "super_admin"],
  },
  {
    id: "warehouse",
    label: "Warehouse",
    icon: Warehouse,
    color: "text-primary",
    description: "Cargo receiving, tallying, dispatch coordination",
    placeholder: "E.g. What's the correct procedure for receiving and tallying a 40ft FCL container?",
    welcome: `# Warehouse AI Assistant
I can help you with:
- **Cargo receiving** — step-by-step receiving and tallying procedures
- **Warehouse operations** — location management, capacity planning
- **Dispatch coordination** — scheduling and routing guidance
- **Cargo documentation** — cargo receipts, tally sheets, condition reports
- **Compliance** — cargo handling standards and safety procedures

What warehouse operation can I help with?`,
    departments: ["warehouse", "operations", "management", "super_admin"],
  },
  {
    id: "chat",
    label: "Smart Chat",
    icon: MessageSquare,
    color: "text-destructive",
    description: "General staff assistant, memos, SOPs, translations",
    placeholder: "Ask anything — draft emails, explain SOPs, translate trade documents...",
    welcome: `# SLAC Smart Assistant
I'm your all-purpose AI assistant. I can help with:
- **Email drafting** — professional client and vendor communications
- **Memo writing** — internal memos, circulars, and announcements
- **SOP guidance** — explain company procedures and best practices
- **Document translation** — trade documents in multiple languages
- **General queries** — freight forwarding, logistics, customs questions

How can I assist you today?`,
    departments: ["operations", "documentation", "accounts", "marketing", "customer_service", "warehouse", "management", "super_admin"],
  },
];

export default function AIAssistant() {
  const { department } = useAuth();
  const [activeModule, setActiveModule] = useState("chat");

  // Filter modules based on department access
  const accessibleModules = modules.filter(m =>
    !department || m.departments.includes(department)
  );

  const currentModule = accessibleModules.find(m => m.id === activeModule) || accessibleModules[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="h-7 w-7 text-primary" />
            SLAC AI Assistant
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Department-aware AI assistant — powered by advanced language models
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1 text-success border-success/40">
            <Zap className="h-3 w-3" />
            Active
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
            <Shield className="h-3 w-3" />
            Interactions logged
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            RBAC-aware
          </Badge>
        </div>
      </div>

      {/* Module Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {accessibleModules.map(mod => (
          <button
            key={mod.id}
            onClick={() => setActiveModule(mod.id)}
            className={`p-3 rounded-xl border text-left transition-all ${
              activeModule === mod.id
                ? "border-primary bg-primary/10 shadow-sm"
                : "border-border bg-card hover:bg-muted/40"
            }`}
          >
            <mod.icon className={`h-5 w-5 mb-2 ${activeModule === mod.id ? "text-primary" : mod.color}`} />
            <p className={`text-xs font-semibold ${activeModule === mod.id ? "text-primary" : "text-foreground"}`}>
              {mod.label}
            </p>
            <p className="text-[9px] text-muted-foreground mt-0.5 leading-tight hidden sm:block">
              {mod.description}
            </p>
          </button>
        ))}
      </div>

      {/* Chat Panel */}
      {currentModule && (
        <AIChatPanel
          key={currentModule.id}
          module={currentModule.id}
          moduleLabel={currentModule.label}
          placeholder={currentModule.placeholder}
          welcomeMessage={currentModule.welcome}
          className="h-[550px]"
        />
      )}

      {/* Info footer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3 px-4">
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              All interactions are logged for audit compliance
            </span>
            <span className="flex items-center gap-1.5">
              <Bot className="h-3.5 w-3.5" />
              Powered by Google Gemini via Lovable AI Gateway
            </span>
            <span className="flex items-center gap-1.5">
              <Brain className="h-3.5 w-3.5" />
              Responses are department-aware based on your role
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
