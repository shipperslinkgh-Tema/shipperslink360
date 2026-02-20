import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Customer, CustomerContact, CustomerDocument } from "@/types/customer";

export function useCustomers() {
  return useQuery({
    queryKey: ["customers"],
    queryFn: async (): Promise<Customer[]> => {
      const { data: customers, error } = await supabase
        .from("customers")
        .select("*")
        .order("company_name");

      if (error) throw error;

      // Fetch contacts and documents for all customers
      const customerIds = customers.map((c: any) => c.id);

      const [contactsRes, docsRes] = await Promise.all([
        supabase.from("customer_contacts").select("*").in("customer_id", customerIds),
        supabase.from("customer_documents").select("*").in("customer_id", customerIds),
      ]);

      return customers.map((c: any): Customer => ({
        id: c.id,
        companyName: c.company_name,
        tradeName: c.trade_name,
        registrationNumber: c.registration_number || "",
        tinNumber: c.tin_number || "",
        industry: c.industry || "",
        companyType: c.company_type,
        address: c.address || "",
        city: c.city || "",
        country: c.country || "Ghana",
        email: c.email,
        phone: c.phone || "",
        website: c.website,
        status: c.status,
        creditLimit: Number(c.credit_limit) || 0,
        outstandingBalance: Number(c.outstanding_balance) || 0,
        totalShipments: c.total_shipments || 0,
        contacts: (contactsRes.data || [])
          .filter((ct: any) => ct.customer_id === c.id)
          .map((ct: any): CustomerContact => ({
            id: ct.id,
            name: ct.name,
            role: ct.role || "",
            email: ct.email || "",
            phone: ct.phone || "",
            isPrimary: ct.is_primary || false,
          })),
        documents: (docsRes.data || [])
          .filter((d: any) => d.customer_id === c.id)
          .map((d: any): CustomerDocument => ({
            id: d.id,
            name: d.name,
            type: d.document_type,
            uploadDate: d.upload_date || "",
            expiryDate: d.expiry_date,
            status: d.status,
            fileSize: d.file_size || "",
          })),
        createdAt: c.created_at,
        lastActivityDate: c.updated_at,
      }));
    },
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const { data, error } = await supabase
        .from("customers")
        .insert({
          company_name: customer.companyName!,
          trade_name: customer.tradeName,
          registration_number: customer.registrationNumber,
          tin_number: customer.tinNumber,
          industry: customer.industry,
          company_type: customer.companyType || "importer",
          address: customer.address,
          city: customer.city,
          country: customer.country || "Ghana",
          email: customer.email!,
          phone: customer.phone,
          website: customer.website,
          credit_limit: customer.creditLimit || 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
  });
}
