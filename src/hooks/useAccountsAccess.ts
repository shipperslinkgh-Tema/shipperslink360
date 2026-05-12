import { useAuth } from "@/contexts/AuthContext";

export function useAccountsAccess() {
  const { isAdmin, department } = useAuth();
  const canEdit = isAdmin || department === "accounts" || department === "management";
  const canView = canEdit || !!department; // any staff
  return { canEdit, canView };
}
