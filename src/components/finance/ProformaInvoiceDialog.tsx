import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { INVOICE_CHARGES, printProforma, proformaTotals, type ProformaData } from "@/lib/printInvoice";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  invoice?: any | null;
}

const empty = (): ProformaData => ({
  date: new Date().toISOString().slice(0, 10),
  invoiceNo: "", customer: "", address1: "", address2: "", phone: "",
  billOfLading: "", vehicle: "", chassis: "", charges: {}, deposit: 0,
});

export default function ProformaInvoiceDialog({ open, onOpenChange, invoice }: Props) {
  const [d, setD] = useState<ProformaData>(empty());

  useEffect(() => {
    if (!open) return;
    const base = empty();
    if (invoice) {
      base.date = invoice.issue_date ?? base.date;
      base.invoiceNo = invoice.invoice_number ?? "";
      base.customer = invoice.customer ?? "";
      base.billOfLading = invoice.shipment_ref ?? "";
      base.deposit = Number(invoice.paid_amount || 0);
    }
    setD(base);
  }, [open, invoice]);

  const set = (k: keyof ProformaData) => (e: React.ChangeEvent<HTMLInputElement>) => setD({ ...d, [k]: e.target.value });
  const { subtotal, balance } = proformaTotals(d);
  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Pro-forma Invoice (print)</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><Label>Date</Label><Input type="date" value={d.date} onChange={set("date")} /></div>
          <div><Label>Invoice No.</Label><Input value={d.invoiceNo} onChange={set("invoiceNo")} /></div>
          <div className="sm:col-span-2"><Label>Client name</Label><Input value={d.customer} onChange={set("customer")} /></div>
          <div><Label>Address line 1</Label><Input value={d.address1} onChange={set("address1")} /></div>
          <div><Label>Address line 2</Label><Input value={d.address2} onChange={set("address2")} /></div>
          <div><Label>Phone</Label><Input value={d.phone} onChange={set("phone")} /></div>
          <div><Label>Bill of Lading</Label><Input value={d.billOfLading} onChange={set("billOfLading")} /></div>
          <div><Label>Vehicle / Container</Label><Input value={d.vehicle} onChange={set("vehicle")} /></div>
          <div><Label>Chassis</Label><Input value={d.chassis} onChange={set("chassis")} /></div>
        </div>
        <div className="border rounded-lg divide-y text-sm">
          {INVOICE_CHARGES.map((c) => (
            <div key={c} className="flex items-center gap-3 p-2">
              <span className="flex-1">{c}</span>
              <Input className="w-40 text-right h-8" type="number" step="0.01" value={d.charges[c] || ""}
                onChange={(e) => setD({ ...d, charges: { ...d.charges, [c]: Number(e.target.value) } })} />
            </div>
          ))}
          <div className="flex p-2 font-semibold"><span className="flex-1">SUBTOTAL (GHS)</span><span className="w-40 text-right pr-3">{fmt(subtotal)}</span></div>
          <div className="flex items-center gap-3 p-2 font-semibold">
            <span className="flex-1">DEPOSIT</span>
            <Input className="w-40 text-right h-8" type="number" step="0.01" value={d.deposit || ""} onChange={(e) => setD({ ...d, deposit: Number(e.target.value) })} />
          </div>
          <div className="flex p-2 font-semibold"><span className="flex-1">BALANCE</span><span className="w-40 text-right pr-3">{fmt(balance)}</span></div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={() => { if (!printProforma(d)) toast.error("Allow pop-ups to print the invoice"); }}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
