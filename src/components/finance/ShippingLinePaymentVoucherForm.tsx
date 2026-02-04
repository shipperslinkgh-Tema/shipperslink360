import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Ship, Plus } from "lucide-react";
import { Currency } from "@/types/finance";

interface PaymentVoucherFormData {
  voucherNumber: string;
  shippingLine: string;
  blNumber: string;
  containerNumbers: string;
  vesselName: string;
  voyageNumber: string;
  paymentType: string;
  amount: string;
  currency: Currency;
  bankAccount: string;
  paymentMethod: string;
  dueDate: string;
  description: string;
  notes: string;
}

const shippingLines = [
  "Maersk Line",
  "MSC - Mediterranean Shipping Company",
  "CMA CGM",
  "Hapag-Lloyd",
  "COSCO Shipping",
  "Evergreen Marine",
  "ONE - Ocean Network Express",
  "Yang Ming",
  "PIL - Pacific International Lines",
  "ZIM Integrated Shipping",
];

const paymentTypes = [
  "D/O Charges",
  "Freight Charges",
  "Demurrage",
  "Detention",
  "Terminal Handling Charges (THC)",
  "Documentation Fee",
  "Bill of Lading Fee",
  "Container Deposit",
  "Seal Charges",
  "Late Documentation Fee",
  "Amendment Charges",
  "Other Charges",
];

const bankAccounts = [
  "GCB Bank - Operations Account",
  "Ecobank - USD Account",
  "Stanbic Bank - Main Account",
  "Fidelity Bank - Petty Cash",
];

const paymentMethods = [
  "Bank Transfer",
  "Cheque",
  "Mobile Money",
  "Cash",
  "Letter of Credit",
];

const currencies: Currency[] = ["GHS", "USD", "EUR", "GBP", "CNY"];

interface ShippingLinePaymentVoucherFormProps {
  onSubmit?: (data: PaymentVoucherFormData) => void;
}

export function ShippingLinePaymentVoucherForm({ onSubmit }: ShippingLinePaymentVoucherFormProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<PaymentVoucherFormData>({
    voucherNumber: `PV-SL-${Date.now().toString().slice(-6)}`,
    shippingLine: "",
    blNumber: "",
    containerNumbers: "",
    vesselName: "",
    voyageNumber: "",
    paymentType: "",
    amount: "",
    currency: "USD",
    bankAccount: "",
    paymentMethod: "",
    dueDate: "",
    description: "",
    notes: "",
  });

  const handleChange = (field: keyof PaymentVoucherFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.shippingLine || !formData.blNumber || !formData.paymentType || !formData.amount) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSubmit?.(formData);
    
    toast({
      title: "Payment Voucher Created",
      description: `Voucher ${formData.voucherNumber} has been created for ${formData.shippingLine}`,
    });
    
    // Reset form and close dialog
    setFormData({
      voucherNumber: `PV-SL-${Date.now().toString().slice(-6)}`,
      shippingLine: "",
      blNumber: "",
      containerNumbers: "",
      vesselName: "",
      voyageNumber: "",
      paymentType: "",
      amount: "",
      currency: "USD",
      bankAccount: "",
      paymentMethod: "",
      dueDate: "",
      description: "",
      notes: "",
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Ship className="h-4 w-4" />
          Shipping Line Voucher
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ship className="h-5 w-5 text-primary" />
            Shipping Line Payment Voucher
          </DialogTitle>
          <DialogDescription>
            Create a payment voucher for shipping line charges (D/O, freight, demurrage, etc.)
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Voucher Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="voucherNumber">Voucher Number</Label>
              <Input
                id="voucherNumber"
                value={formData.voucherNumber}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
              />
            </div>
          </div>

          {/* Shipping Line Selection */}
          <div className="space-y-2">
            <Label htmlFor="shippingLine">Shipping Line *</Label>
            <Select
              value={formData.shippingLine}
              onValueChange={(value) => handleChange("shippingLine", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shipping line" />
              </SelectTrigger>
              <SelectContent>
                {shippingLines.map((line) => (
                  <SelectItem key={line} value={line}>
                    {line}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Shipment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="blNumber">Bill of Lading Number *</Label>
              <Input
                id="blNumber"
                placeholder="e.g., MAEU1234567890"
                value={formData.blNumber}
                onChange={(e) => handleChange("blNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="containerNumbers">Container Number(s)</Label>
              <Input
                id="containerNumbers"
                placeholder="e.g., MSKU1234567, MSKU7654321"
                value={formData.containerNumbers}
                onChange={(e) => handleChange("containerNumbers", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="e.g., MSC OSCAR"
                value={formData.vesselName}
                onChange={(e) => handleChange("vesselName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="voyageNumber">Voyage Number</Label>
              <Input
                id="voyageNumber"
                placeholder="e.g., 2024W01"
                value={formData.voyageNumber}
                onChange={(e) => handleChange("voyageNumber", e.target.value)}
              />
            </div>
          </div>

          {/* Payment Details */}
          <div className="space-y-2">
            <Label htmlFor="paymentType">Payment Type *</Label>
            <Select
              value={formData.paymentType}
              onValueChange={(value) => handleChange("paymentType", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment type" />
              </SelectTrigger>
              <SelectContent>
                {paymentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleChange("currency", value as Currency)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((curr) => (
                    <SelectItem key={curr} value={curr}>
                      {curr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Select
                value={formData.bankAccount}
                onValueChange={(value) => handleChange("bankAccount", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank account" />
                </SelectTrigger>
                <SelectContent>
                  {bankAccounts.map((account) => (
                    <SelectItem key={account} value={account}>
                      {account}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentMethod">Payment Method</Label>
              <Select
                value={formData.paymentMethod}
                onValueChange={(value) => handleChange("paymentMethod", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  {paymentMethods.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description & Notes */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="Brief description of payment"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes or references..."
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Create Voucher
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
