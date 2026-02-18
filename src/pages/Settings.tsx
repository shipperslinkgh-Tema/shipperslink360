import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings, Users, Building2, DollarSign, FileText, Warehouse, Bell, Shield,
  Globe, Lock, Save, Plus, Trash2, Edit, Check, X, Key, Database, Mail,
  MessageSquare, AlertTriangle, Brain, Clock, RefreshCw, Sliders,
} from "lucide-react";
import { toast } from "sonner";

// ────────────────────────────────────────────────────────────
// Sub-section: Section Header
// ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, description }: { icon: React.ComponentType<{ className?: string }>; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 1. User & Role Management Tab
// ────────────────────────────────────────────────────────────
function UserRoleTab() {
  const [passwordPolicy, setPasswordPolicy] = useState({ minLength: "8", requireUpper: true, requireNumber: true, requireSymbol: true, expiryDays: "90" });
  const [twoFA, setTwoFA] = useState({ enforced: false, gracePeriod: "7" });
  const [loginHistory] = useState([
    { user: "Kwame Asante", action: "Login", ip: "196.52.43.1", time: "2026-02-18 09:12", status: "success" },
    { user: "Ama Boateng", action: "Failed Login", ip: "196.52.43.44", time: "2026-02-18 08:55", status: "failed" },
    { user: "Kofi Mensah", action: "Password Reset", ip: "10.0.0.5", time: "2026-02-17 16:30", status: "success" },
  ]);

  const save = () => toast.success("User & Role settings saved successfully");

  return (
    <div className="space-y-6">
      <SectionHeader icon={Users} title="User & Role Management" description="Configure password policies, 2FA, and view activity logs" />

      {/* Password Policy */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" /> Password Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Minimum Length</Label>
              <Input type="number" value={passwordPolicy.minLength} onChange={e => setPasswordPolicy(p => ({ ...p, minLength: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Password Expiry (days)</Label>
              <Input type="number" value={passwordPolicy.expiryDays} onChange={e => setPasswordPolicy(p => ({ ...p, expiryDays: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-3">
            {[
              { key: "requireUpper", label: "Require uppercase letter" },
              { key: "requireNumber", label: "Require numeric character" },
              { key: "requireSymbol", label: "Require special symbol (!@#$)" },
            ].map(({ key, label }) => (
              <div key={key} className="flex items-center justify-between">
                <Label className="font-normal">{label}</Label>
                <Switch checked={passwordPolicy[key as keyof typeof passwordPolicy] as boolean} onCheckedChange={v => setPasswordPolicy(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 2FA Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Shield className="h-4 w-4 text-primary" /> Two-Factor Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enforce 2FA for All Users</Label>
              <p className="text-xs text-muted-foreground">Require all staff to set up 2FA on next login</p>
            </div>
            <Switch checked={twoFA.enforced} onCheckedChange={v => setTwoFA(t => ({ ...t, enforced: v }))} />
          </div>
          <div className="space-y-1.5">
            <Label>Grace Period (days before mandatory)</Label>
            <Input type="number" value={twoFA.gracePeriod} onChange={e => setTwoFA(t => ({ ...t, gracePeriod: e.target.value }))} className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* RBAC Role Permissions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Sliders className="h-4 w-4 text-primary" /> Role Access Permissions (RBAC)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Module</TableHead>
                <TableHead className="text-center">Super Admin</TableHead>
                <TableHead className="text-center">Admin</TableHead>
                <TableHead className="text-center">Manager</TableHead>
                <TableHead className="text-center">Staff</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { module: "Finance & Invoicing", sa: true, admin: true, mgr: true, staff: false },
                { module: "User Management", sa: true, admin: true, mgr: false, staff: false },
                { module: "Settings Portal", sa: true, admin: true, mgr: false, staff: false },
                { module: "AI Assistant", sa: true, admin: true, mgr: true, staff: true },
                { module: "Customs & Declarations", sa: true, admin: true, mgr: true, staff: true },
                { module: "Warehouse Operations", sa: true, admin: true, mgr: true, staff: true },
                { module: "Client Portal (Manage)", sa: true, admin: true, mgr: false, staff: false },
                { module: "Reports & Analytics", sa: true, admin: true, mgr: true, staff: false },
              ].map(row => (
                <TableRow key={row.module}>
                  <TableCell className="font-medium text-sm">{row.module}</TableCell>
                  {[row.sa, row.admin, row.mgr, row.staff].map((val, i) => (
                    <TableCell key={i} className="text-center">
                      {val ? <Check className="h-4 w-4 text-success mx-auto" /> : <X className="h-4 w-4 text-muted-foreground mx-auto" />}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Recent Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead><TableHead>Action</TableHead><TableHead>IP Address</TableHead><TableHead>Time</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginHistory.map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{row.user}</TableCell>
                  <TableCell className="text-sm">{row.action}</TableCell>
                  <TableCell className="font-mono text-xs">{row.ip}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.time}</TableCell>
                  <TableCell>
                    <Badge variant={row.status === "success" ? "secondary" : "destructive"} className={row.status === "success" ? "bg-success/10 text-success border-0" : ""}>
                      {row.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={save}><Save className="mr-2 h-4 w-4" />Save User Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 2. Department & Workflow Tab
// ────────────────────────────────────────────────────────────
function DepartmentTab() {
  const [departments, setDepartments] = useState([
    { name: "Operations", head: "Kwame Asante", staff: 8, active: true },
    { name: "Documentation", head: "Ama Boateng", staff: 5, active: true },
    { name: "Accounts", head: "Kofi Mensah", staff: 4, active: true },
    { name: "Warehouse", head: "Abena Darko", staff: 12, active: true },
    { name: "Customer Service", head: "Efua Owusu", staff: 3, active: true },
    { name: "Marketing", head: "Nana Yaw", staff: 2, active: false },
  ]);
  const [workflows] = useState([
    { name: "Cargo Release", trigger: "DO Received", approver: "Accounts", escalation: "24h → Manager" },
    { name: "Invoice Approval", trigger: "Invoice Created", approver: "Finance Manager", escalation: "48h → Super Admin" },
    { name: "Expense Request", trigger: "Expense Submitted", approver: "Department Head", escalation: "72h → Admin" },
  ]);

  return (
    <div className="space-y-6">
      <SectionHeader icon={Building2} title="Department & Workflow Settings" description="Manage departments, approval workflows and escalation rules" />

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Departments</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add Department</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead><TableHead>Head</TableHead><TableHead>Staff</TableHead><TableHead>Status</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map((d, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{d.name}</TableCell>
                  <TableCell className="text-sm">{d.head}</TableCell>
                  <TableCell><Badge variant="secondary">{d.staff}</Badge></TableCell>
                  <TableCell>
                    <Switch checked={d.active} onCheckedChange={v => setDepartments(prev => prev.map((x, j) => j === i ? { ...x, active: v } : x))} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Approval Workflows</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add Workflow</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Workflow</TableHead><TableHead>Trigger</TableHead><TableHead>Approver</TableHead><TableHead>Escalation</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((w, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{w.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{w.trigger}</TableCell>
                  <TableCell><Badge variant="secondary">{w.approver}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{w.escalation}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Auto-Notifications per Department</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { dept: "Operations", events: "New shipment arrived, DO released" },
            { dept: "Accounts", events: "Invoice overdue, Payment received" },
            { dept: "Warehouse", events: "Cargo aging alert, Storage limit reached" },
            { dept: "Customer Service", events: "Client message received, Shipment delayed" },
          ].map(({ dept, events }) => (
            <div key={dept} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{dept}</p>
                <p className="text-xs text-muted-foreground">{events}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => toast.success("Department settings saved")}><Save className="mr-2 h-4 w-4" />Save Department Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 3. Finance & Billing Tab
// ────────────────────────────────────────────────────────────
function FinanceTab() {
  const [taxRates, setTaxRates] = useState({ vat: "15", nhil: "2.5", getfund: "2.5", covid: "1" });
  const [storageRates, setStorageRates] = useState({ perCBM: "5.00", perDay: "2.50", perPallet: "3.00", freeDays: "7" });
  const [demurrage, setDemurrage] = useState({ fcl20: "25.00", fcl40: "40.00", lcl: "15.00", airCargo: "10.00" });
  const [invoiceFormat, setInvoiceFormat] = useState({ prefix: "INV", year: true, sequence: "0001", separator: "-" });
  const [paymentMethods, setPaymentMethods] = useState({ bank: true, momo: true, transfer: true, cash: false, cheque: false });

  return (
    <div className="space-y-6">
      <SectionHeader icon={DollarSign} title="Finance & Billing Settings" description="Configure tax rates, storage charges, and invoice formatting" />

      <div className="grid grid-cols-2 gap-6">
        {/* Tax Rates */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Tax & Levy Rates (%)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "vat", label: "VAT" },
              { key: "nhil", label: "NHIL (National Health Insurance Levy)" },
              { key: "getfund", label: "GETFund Levy" },
              { key: "covid", label: "COVID-19 Health Recovery Levy" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" step="0.5" value={taxRates[key as keyof typeof taxRates]}
                    onChange={e => setTaxRates(t => ({ ...t, [key]: e.target.value }))} className="w-24" />
                  <span className="text-sm text-muted-foreground">%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Storage Rates */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Warehouse Storage Rates (GHS)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "perCBM", label: "Rate per CBM/day" },
              { key: "perDay", label: "Flat rate per day" },
              { key: "perPallet", label: "Rate per pallet/day" },
              { key: "freeDays", label: "Free storage days" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <Input type="number" step="0.50" value={storageRates[key as keyof typeof storageRates]}
                  onChange={e => setStorageRates(r => ({ ...r, [key]: e.target.value }))} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Demurrage Rates */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Demurrage Rates (USD/day)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "fcl20", label: "FCL 20ft Container" },
              { key: "fcl40", label: "FCL 40ft Container" },
              { key: "lcl", label: "LCL (per CBM)" },
              { key: "airCargo", label: "Air Cargo (per kg)" },
            ].map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <Label className="text-xs">{label}</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">$</span>
                  <Input type="number" step="1" value={demurrage[key as keyof typeof demurrage]}
                    onChange={e => setDemurrage(d => ({ ...d, [key]: e.target.value }))} className="w-28" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Invoice Numbering */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Invoice Numbering Format</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label className="text-xs">Prefix</Label>
              <Input value={invoiceFormat.prefix} onChange={e => setInvoiceFormat(f => ({ ...f, prefix: e.target.value }))} placeholder="INV" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Separator</Label>
              <Select value={invoiceFormat.separator} onValueChange={v => setInvoiceFormat(f => ({ ...f, separator: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="-">Hyphen (-)</SelectItem>
                  <SelectItem value="/">/</SelectItem>
                  <SelectItem value=".">Dot (.)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-normal">Include year in number</Label>
              <Switch checked={invoiceFormat.year} onCheckedChange={v => setInvoiceFormat(f => ({ ...f, year: v }))} />
            </div>
            <div className="p-2 bg-muted rounded text-sm font-mono text-center">
              Preview: {invoiceFormat.prefix}{invoiceFormat.separator}{invoiceFormat.year ? "2026" + invoiceFormat.separator : ""}{invoiceFormat.sequence}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Accepted Payment Methods</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
          {Object.entries(paymentMethods).map(([key, val]) => (
            <div key={key} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <Label className="capitalize font-normal">{key === "momo" ? "Mobile Money (MoMo)" : key}</Label>
              <Switch checked={val} onCheckedChange={v => setPaymentMethods(p => ({ ...p, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => toast.success("Finance settings saved")}><Save className="mr-2 h-4 w-4" />Save Finance Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 4. Customs & Documentation Tab
// ────────────────────────────────────────────────────────────
function CustomsTab() {
  const [hsCodes] = useState([
    { code: "8471.30", description: "Portable ADP machines, weight ≤ 10kg", dutyRate: "0%" },
    { code: "8703.23", description: "Motor cars, cylinder capacity 1500–3000cc", dutyRate: "20%" },
    { code: "0901.11", description: "Coffee, not roasted, not decaffeinated", dutyRate: "5%" },
    { code: "6110.20", description: "Jerseys, pullovers of cotton", dutyRate: "35%" },
  ]);
  const [docValidation, setDocValidation] = useState({ blRequired: true, packingList: true, certificate: false, phytoSanitary: false, ictad: true });

  return (
    <div className="space-y-6">
      <SectionHeader icon={FileText} title="Customs & Documentation Settings" description="HS code database, document templates, and ICUMS configuration" />

      {/* HS Code Database */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">HS Code Reference Database</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add HS Code</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3">
            <Input placeholder="Search HS codes or product description..." />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>HS Code</TableHead><TableHead>Description</TableHead><TableHead>Duty Rate</TableHead><TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hsCodes.map((h, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-sm font-semibold">{h.code}</TableCell>
                  <TableCell className="text-sm">{h.description}</TableCell>
                  <TableCell><Badge variant="secondary">{h.dutyRate}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm"><Edit className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Document Templates */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Document Templates</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {["Bill of Lading (BL)", "Airway Bill (AWB)", "Delivery Note", "Commercial Invoice", "Packing List", "Customs Declaration"].map(doc => (
            <div key={doc} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm font-medium">{doc}</span>
              <Button size="sm" variant="outline"><Edit className="h-3.5 w-3.5 mr-1" />Edit</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Mandatory Document Validation */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Mandatory Document Validation Rules</CardTitle>
          <CardDescription className="text-xs">These documents will be required before cargo release approval</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "blRequired", label: "Bill of Lading / AWB", desc: "Required for all shipments" },
            { key: "packingList", label: "Packing List", desc: "Must match manifest quantities" },
            { key: "certificate", label: "Certificate of Origin", desc: "Required for duty-exempt goods" },
            { key: "phytoSanitary", label: "Phytosanitary Certificate", desc: "Required for agricultural imports" },
            { key: "ictad", label: "ICTAD Certification", desc: "Required for used goods/machinery" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={docValidation[key as keyof typeof docValidation]} onCheckedChange={v => setDocValidation(d => ({ ...d, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ICUMS Configuration */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">ICUMS Integration Configuration</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5"><Label>ICUMS API Endpoint</Label><Input placeholder="https://icums.gra.gov.gh/api/v1" /></div>
          <div className="space-y-1.5"><Label>Customs Office Code</Label><Input placeholder="TEMA001" /></div>
          <div className="space-y-1.5"><Label>Declarant Agent Code</Label><Input placeholder="AGT-0012345" /></div>
          <div className="space-y-1.5"><Label>Default Port of Entry</Label>
            <Select defaultValue="tema">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tema">Tema Port</SelectItem>
                <SelectItem value="kotoka">Kotoka Int'l Airport</SelectItem>
                <SelectItem value="takoradi">Takoradi Port</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => toast.success("Customs settings saved")}><Save className="mr-2 h-4 w-4" />Save Customs Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 5. Warehouse Tab
// ────────────────────────────────────────────────────────────
function WarehouseSettingsTab() {
  const [zones, setZones] = useState([
    { name: "Zone A", type: "General", capacity: 500, used: 320, active: true },
    { name: "Zone B", type: "Refrigerated", capacity: 200, used: 80, active: true },
    { name: "Zone C", type: "Hazardous", capacity: 100, used: 45, active: false },
  ]);
  const [agingAlerts, setAgingAlerts] = useState({ day7: true, day14: true, day30: true, day60: true });
  const [inventoryMethod, setInventoryMethod] = useState("FIFO");

  return (
    <div className="space-y-6">
      <SectionHeader icon={Warehouse} title="Warehouse Settings" description="Zones, capacity, aging thresholds, and inventory rules" />

      {/* Zones */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Warehouse Zones & Capacity</CardTitle>
            <Button size="sm" variant="outline"><Plus className="mr-1 h-3.5 w-3.5" />Add Zone</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone</TableHead><TableHead>Type</TableHead><TableHead>Capacity (CBM)</TableHead><TableHead>Utilization</TableHead><TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones.map((z, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium text-sm">{z.name}</TableCell>
                  <TableCell><Badge variant="secondary">{z.type}</Badge></TableCell>
                  <TableCell className="text-sm">{z.used} / {z.capacity} CBM</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${(z.used / z.capacity) * 100}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round((z.used / z.capacity) * 100)}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={z.active} onCheckedChange={v => setZones(prev => prev.map((x, j) => j === i ? { ...x, active: v } : x))} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Aging Alerts */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm"><AlertTriangle className="inline h-4 w-4 text-warning mr-2" />Cargo Aging Alert Thresholds</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { key: "day7", label: "7-Day Alert (Yellow)", desc: "Early warning to operations" },
              { key: "day14", label: "14-Day Alert (Orange)", desc: "Notify customer service" },
              { key: "day30", label: "30-Day Alert (Red)", desc: "Escalate to management" },
              { key: "day60", label: "60-Day Alert (Critical)", desc: "Legal action trigger" },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-1.5">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{desc}</p>
                </div>
                <Switch checked={agingAlerts[key as keyof typeof agingAlerts]} onCheckedChange={v => setAgingAlerts(a => ({ ...a, [key]: v }))} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Inventory Method & Cargo Categories */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Inventory Management Method</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["FIFO", "LIFO", "FEFO"].map(method => (
                  <div key={method} onClick={() => setInventoryMethod(method)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${inventoryMethod === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{method}</span>
                      {inventoryMethod === method && <Check className="h-4 w-4 text-primary" />}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {method === "FIFO" ? "First In, First Out" : method === "LIFO" ? "Last In, First Out" : "First Expired, First Out"}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm">Cargo Condition Categories</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {["Excellent", "Good", "Fair", "Damaged", "Rejected"].map(cat => (
                <div key={cat} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                  <span className="text-sm">{cat}</span>
                  <Switch defaultChecked={cat !== "Rejected"} />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end"><Button onClick={() => toast.success("Warehouse settings saved")}><Save className="mr-2 h-4 w-4" />Save Warehouse Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 6. Notifications Tab
// ────────────────────────────────────────────────────────────
function NotificationsTab() {
  const [smtp, setSmtp] = useState({ host: "smtp.gmail.com", port: "587", user: "noreply@shipperslink.com", tls: true });
  const [sms, setSms] = useState({ provider: "arkesel", apiKey: "", senderId: "SLAC" });
  const [alerts, setAlerts] = useState({ storageOverdue: true, unpaidInvoice: true, delayedShipment: true, doExpiry: true, systemDown: true });

  return (
    <div className="space-y-6">
      <SectionHeader icon={Bell} title="Notification & Communication Settings" description="Configure SMTP, SMS, templates, and system alerts" />

      <div className="grid grid-cols-2 gap-6">
        {/* SMTP */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />Email Server (SMTP)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5"><Label>SMTP Host</Label><Input value={smtp.host} onChange={e => setSmtp(s => ({ ...s, host: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Port</Label><Input value={smtp.port} onChange={e => setSmtp(s => ({ ...s, port: e.target.value }))} className="w-24" /></div>
            <div className="space-y-1.5"><Label>Username / Email</Label><Input value={smtp.user} onChange={e => setSmtp(s => ({ ...s, user: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Password</Label><Input type="password" placeholder="••••••••" /></div>
            <div className="flex items-center justify-between">
              <Label className="font-normal">Enable TLS/SSL</Label>
              <Switch checked={smtp.tls} onCheckedChange={v => setSmtp(s => ({ ...s, tls: v }))} />
            </div>
            <Button variant="outline" size="sm" className="w-full">Send Test Email</Button>
          </CardContent>
        </Card>

        {/* SMS */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />SMS / OTP Provider</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label>SMS Provider</Label>
              <Select value={sms.provider} onValueChange={v => setSms(s => ({ ...s, provider: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="arkesel">Arkesel (Ghana)</SelectItem>
                  <SelectItem value="mnotify">mNotify</SelectItem>
                  <SelectItem value="hubtel">Hubtel</SelectItem>
                  <SelectItem value="twilio">Twilio</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>API Key</Label><Input type="password" value={sms.apiKey} onChange={e => setSms(s => ({ ...s, apiKey: e.target.value }))} placeholder="Enter API key" /></div>
            <div className="space-y-1.5"><Label>Sender ID</Label><Input value={sms.senderId} onChange={e => setSms(s => ({ ...s, senderId: e.target.value }))} maxLength={11} /></div>
            <Button variant="outline" size="sm" className="w-full">Send Test SMS</Button>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">System Alert Rules</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "storageOverdue", label: "Storage Overdue Alert", desc: "Notify when cargo exceeds free storage period" },
            { key: "unpaidInvoice", label: "Unpaid Invoice Alert", desc: "Send reminder after invoice due date" },
            { key: "delayedShipment", label: "Delayed Shipment Alert", desc: "Notify when ETA is exceeded by >24h" },
            { key: "doExpiry", label: "DO Expiry Alert", desc: "Warn 48h before Delivery Order expires" },
            { key: "systemDown", label: "System Downtime Alert", desc: "Notify admin on critical system failures" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={alerts[key as keyof typeof alerts]} onCheckedChange={v => setAlerts(a => ({ ...a, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Email Templates */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Automated Client Update Templates</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {["Shipment Arrival Notification", "DO Release Confirmation", "Invoice Issued", "Payment Received", "Customs Clearance Complete"].map(tpl => (
            <div key={tpl} className="flex items-center justify-between p-3 border border-border rounded-lg">
              <span className="text-sm">{tpl}</span>
              <Button size="sm" variant="outline"><Edit className="h-3.5 w-3.5 mr-1" />Edit Template</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end"><Button onClick={() => toast.success("Notification settings saved")}><Save className="mr-2 h-4 w-4" />Save Notification Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 7. System Configuration Tab
// ────────────────────────────────────────────────────────────
function SystemTab() {
  const [company, setCompany] = useState({
    name: "Shippers Link Agencies Co., Ltd",
    tin: "C0012345678",
    address: "Tema Community 1, Tema, Greater Accra, Ghana",
    phone: "+233 30 123 4567",
    email: "info@shipperslink.com",
    website: "www.shipperslink.com",
  });
  const [system, setSystem] = useState({ timezone: "Africa/Accra", currency: "GHS", backupFreq: "daily", auditRetention: "365", aiEnabled: true });

  return (
    <div className="space-y-6">
      <SectionHeader icon={Globe} title="System Configuration" description="Company profile, timezone, backup, and AI settings" />

      {/* Company Profile */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Company Profile</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Company Name</Label><Input value={company.name} onChange={e => setCompany(c => ({ ...c, name: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>TIN Number</Label><Input value={company.tin} onChange={e => setCompany(c => ({ ...c, tin: e.target.value }))} /></div>
            <div className="space-y-1.5 col-span-2"><Label>Business Address</Label><Input value={company.address} onChange={e => setCompany(c => ({ ...c, address: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input value={company.phone} onChange={e => setCompany(c => ({ ...c, phone: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input type="email" value={company.email} onChange={e => setCompany(c => ({ ...c, email: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Website</Label><Input value={company.website} onChange={e => setCompany(c => ({ ...c, website: e.target.value }))} /></div>
          </div>
          <div className="space-y-1.5">
            <Label>Company Logo</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground text-sm">
              <p>Drag & drop your logo here, or <span className="text-primary cursor-pointer">browse</span></p>
              <p className="text-xs mt-1">PNG, JPG up to 2MB. Recommended: 200×200px</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm">Regional & Data Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Select value={system.timezone} onValueChange={v => setSystem(s => ({ ...s, timezone: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Accra">Africa/Accra (GMT+0)</SelectItem>
                  <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                  <SelectItem value="Europe/London">Europe/London (GMT+0/+1)</SelectItem>
                  <SelectItem value="America/New_York">America/New_York (GMT-5/-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Base Currency</Label>
              <Select value={system.currency} onValueChange={v => setSystem(s => ({ ...s, currency: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GHS">GHS — Ghana Cedi</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR — Euro</SelectItem>
                  <SelectItem value="GBP">GBP — British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Data Backup Frequency</Label>
              <Select value={system.backupFreq} onValueChange={v => setSystem(s => ({ ...s, backupFreq: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Hourly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Audit Log Retention (days)</Label>
              <Input type="number" value={system.auditRetention} onChange={e => setSystem(s => ({ ...s, auditRetention: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Brain className="h-4 w-4 text-primary" />AI Assistant</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable AI Assistant</Label>
                  <p className="text-xs text-muted-foreground">Allow staff to use the AI chat assistant</p>
                </div>
                <Switch checked={system.aiEnabled} onCheckedChange={v => setSystem(s => ({ ...s, aiEnabled: v }))} />
              </div>
              <Separator />
              <p className="text-xs text-muted-foreground">AI Model: Google Gemini 3 Flash (Lovable AI Gateway)</p>
              <p className="text-xs text-muted-foreground">Audit logging: Enabled for all interactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Key className="h-4 w-4 text-primary" />API Integration Keys</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "GRA / ICUMS API", status: "Connected" },
                { label: "GPHA Port API", status: "Not Connected" },
                { label: "Bank API (GCB)", status: "Connected" },
                { label: "MoMo Payment Gateway", status: "Not Connected" },
              ].map(({ label, status }) => (
                <div key={label} className="flex items-center justify-between py-1.5">
                  <span className="text-sm">{label}</span>
                  <Badge variant={status === "Connected" ? "secondary" : "destructive"}
                    className={status === "Connected" ? "bg-success/10 text-success border-0 text-xs" : "text-xs"}>
                    {status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Data Management</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm"><RefreshCw className="mr-2 h-3.5 w-3.5" />Run Manual Backup Now</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-destructive hover:text-destructive border-destructive/30" size="sm">
                    <Trash2 className="mr-2 h-3.5 w-3.5" />Clear Old Audit Logs
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear Audit Logs?</AlertDialogTitle>
                    <AlertDialogDescription>This will permanently delete audit logs older than {system.auditRetention} days. This action cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive hover:bg-destructive/90" onClick={() => toast.success("Old audit logs cleared")}>Confirm Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end"><Button onClick={() => toast.success("System settings saved")}><Save className="mr-2 h-4 w-4" />Save System Settings</Button></div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// 8. Security Controls Tab
// ────────────────────────────────────────────────────────────
function SecurityTab() {
  const [session, setSession] = useState({ timeout: "15", maxAttempts: "5", lockDuration: "30" });
  const [ipRestriction, setIpRestriction] = useState({ enabled: false, allowedIPs: "196.52.43.0/24\n10.0.0.0/8" });
  const [encryption, setEncryption] = useState({ atRest: true, inTransit: true, backupEncrypt: true });

  return (
    <div className="space-y-6">
      <SectionHeader icon={Shield} title="Security Controls" description="Session management, IP restrictions, and encryption settings" />

      <div className="grid grid-cols-2 gap-6">
        {/* Session Settings */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />Session & Login Controls</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>Session Timeout (minutes)</Label>
              <Input type="number" value={session.timeout} onChange={e => setSession(s => ({ ...s, timeout: e.target.value }))} />
              <p className="text-xs text-muted-foreground">Users will be automatically logged out after this period of inactivity</p>
            </div>
            <div className="space-y-1.5">
              <Label>Max Login Attempts Before Lockout</Label>
              <Input type="number" value={session.maxAttempts} onChange={e => setSession(s => ({ ...s, maxAttempts: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Account Lock Duration (minutes)</Label>
              <Input type="number" value={session.lockDuration} onChange={e => setSession(s => ({ ...s, lockDuration: e.target.value }))} />
            </div>
          </CardContent>
        </Card>

        {/* IP Restriction */}
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="h-4 w-4 text-primary" />IP Access Restriction</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable IP Whitelist</Label>
                <p className="text-xs text-muted-foreground">Only allow logins from approved IP ranges</p>
              </div>
              <Switch checked={ipRestriction.enabled} onCheckedChange={v => setIpRestriction(r => ({ ...r, enabled: v }))} />
            </div>
            {ipRestriction.enabled && (
              <div className="space-y-1.5">
                <Label>Allowed IP Ranges (one per line)</Label>
                <Textarea value={ipRestriction.allowedIPs} onChange={e => setIpRestriction(r => ({ ...r, allowedIPs: e.target.value }))}
                  className="font-mono text-xs" rows={5} placeholder="192.168.1.0/24&#10;10.0.0.0/8" />
                <p className="text-xs text-muted-foreground">CIDR notation supported (e.g., 192.168.1.0/24)</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Encryption */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Lock className="h-4 w-4 text-primary" />Data Encryption Settings</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "atRest", label: "Encryption at Rest", desc: "All stored data is encrypted using AES-256" },
            { key: "inTransit", label: "Encryption in Transit (TLS/HTTPS)", desc: "All data transmissions use TLS 1.3 encryption" },
            { key: "backupEncrypt", label: "Backup Encryption", desc: "All database backups are encrypted before storage" },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
              <Switch checked={encryption[key as keyof typeof encryption]} onCheckedChange={v => setEncryption(e => ({ ...e, [key]: v }))} />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Audit */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">Change History Log</CardTitle>
          <CardDescription className="text-xs">Recent security-related configuration changes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Changed By</TableHead><TableHead>Change</TableHead><TableHead>Old Value</TableHead><TableHead>New Value</TableHead><TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { by: "Kwame Asante", change: "Session Timeout", old: "30 min", val: "15 min", time: "2026-02-18 10:05" },
                { by: "Admin", change: "Max Login Attempts", old: "3", val: "5", time: "2026-02-17 14:22" },
                { by: "Kwame Asante", change: "2FA Enforcement", old: "Disabled", val: "Enabled", time: "2026-02-15 09:14" },
              ].map((row, i) => (
                <TableRow key={i}>
                  <TableCell className="text-sm font-medium">{row.by}</TableCell>
                  <TableCell className="text-sm">{row.change}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.old}</TableCell>
                  <TableCell className="text-xs font-medium">{row.val}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{row.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button><Save className="mr-2 h-4 w-4" />Save Security Settings</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apply Security Changes?</AlertDialogTitle>
              <AlertDialogDescription>
                Changing security settings may affect active sessions and could log out users currently connected. Are you sure you want to apply these changes?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => toast.success("Security settings saved and applied")}>Yes, Apply Changes</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Main Settings Page
// ────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const { isAdmin, profile, roles } = useAuth();

  const isManagement = isAdmin || roles.includes("manager");

  if (!isManagement) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <Shield className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-lg font-semibold text-foreground">Access Restricted</h2>
        <p className="text-muted-foreground text-sm text-center max-w-sm">
          The Settings Portal is only accessible to Admin, Super Admin, and Management roles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" />Settings Portal
          </h1>
          <p className="text-muted-foreground text-sm">System configuration for Shippers Link Agencies Co., Ltd</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {roles[0]?.replace("_", " ") || "Admin"} Access
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            v2.0.0
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="users" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Users & Roles</TabsTrigger>
          <TabsTrigger value="departments" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />Departments</TabsTrigger>
          <TabsTrigger value="finance" className="gap-1.5 text-xs"><DollarSign className="h-3.5 w-3.5" />Finance</TabsTrigger>
          <TabsTrigger value="customs" className="gap-1.5 text-xs"><FileText className="h-3.5 w-3.5" />Customs & Docs</TabsTrigger>
          <TabsTrigger value="warehouse" className="gap-1.5 text-xs"><Warehouse className="h-3.5 w-3.5" />Warehouse</TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5 text-xs"><Bell className="h-3.5 w-3.5" />Notifications</TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" />System</TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="users"><UserRoleTab /></TabsContent>
        <TabsContent value="departments"><DepartmentTab /></TabsContent>
        <TabsContent value="finance"><FinanceTab /></TabsContent>
        <TabsContent value="customs"><CustomsTab /></TabsContent>
        <TabsContent value="warehouse"><WarehouseSettingsTab /></TabsContent>
        <TabsContent value="notifications"><NotificationsTab /></TabsContent>
        <TabsContent value="system"><SystemTab /></TabsContent>
        <TabsContent value="security"><SecurityTab /></TabsContent>
      </Tabs>
    </div>
  );
}
