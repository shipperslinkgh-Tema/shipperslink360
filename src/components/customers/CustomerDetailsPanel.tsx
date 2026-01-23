import { Customer } from "@/types/customer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  User,
  Download,
  X,
  CreditCard,
  Ship,
  Calendar,
  Hash,
} from "lucide-react";

interface CustomerDetailsPanelProps {
  customer: Customer;
  onClose: () => void;
}

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  suspended: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const documentStatusColors = {
  valid: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  expired: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
};

const documentTypeLabels = {
  registration: "Registration",
  license: "License",
  contract: "Contract",
  invoice: "Invoice",
  other: "Other",
};

const companyTypeLabels = {
  importer: "Importer",
  exporter: "Exporter",
  both: "Importer/Exporter",
  freight_forwarder: "Freight Forwarder",
};

export function CustomerDetailsPanel({ customer, onClose }: CustomerDetailsPanelProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-background border-l shadow-xl z-50 overflow-y-auto">
      <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{customer.companyName}</h2>
            {customer.tradeName && (
              <p className="text-sm text-muted-foreground">({customer.tradeName})</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[customer.status]}>
            {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
          </Badge>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <Ship className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Shipments</span>
              </div>
              <p className="text-2xl font-bold mt-1">{customer.totalShipments}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Credit Limit</span>
              </div>
              <p className="text-2xl font-bold mt-1">{formatCurrency(customer.creditLimit)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Outstanding</span>
              </div>
              <p className="text-2xl font-bold mt-1 text-amber-600">
                {formatCurrency(customer.outstandingBalance)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-4 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      Registration No.
                    </div>
                    <p className="font-medium">{customer.registrationNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="h-4 w-4" />
                      TIN Number
                    </div>
                    <p className="font-medium">{customer.tinNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      Industry
                    </div>
                    <p className="font-medium">{customer.industry}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Ship className="h-4 w-4" />
                      Company Type
                    </div>
                    <Badge variant="outline">{companyTypeLabels[customer.companyType]}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      Address
                    </div>
                    <p className="font-medium">{customer.address}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.city}, {customer.country}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        Email
                      </div>
                      <p className="font-medium">{customer.email}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        Phone
                      </div>
                      <p className="font-medium">{customer.phone}</p>
                    </div>
                    {customer.website && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Globe className="h-4 w-4" />
                          Website
                        </div>
                        <p className="font-medium text-primary">{customer.website}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Account Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Customer Since
                    </div>
                    <p className="font-medium">{customer.createdAt}</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      Last Activity
                    </div>
                    <p className="font-medium">{customer.lastActivityDate}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact Persons</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customer.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start gap-4 p-4 rounded-lg border bg-muted/30"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{contact.name}</p>
                          {contact.isPrimary && (
                            <Badge variant="secondary" className="text-xs">
                              Primary
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{contact.role}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{contact.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{contact.phone}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="mt-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-base">Documents</CardTitle>
                <Button size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Upload Document
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customer.documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-muted-foreground">{doc.fileSize}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{documentTypeLabels[doc.type]}</Badge>
                        </TableCell>
                        <TableCell className="text-sm">{doc.uploadDate}</TableCell>
                        <TableCell className="text-sm">{doc.expiryDate || "-"}</TableCell>
                        <TableCell>
                          <Badge className={documentStatusColors[doc.status]}>
                            {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
