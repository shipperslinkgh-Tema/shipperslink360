import { useAuth } from "@/contexts/AuthContext";

export function useAccountsAccess() {
  const { isAdmin, department } = useAuth();
  const isAccountsDept = department === "accounts" || department === "management" || department === "super_admin";
  const canEdit = isAdmin || isAccountsDept;
  const canView = canEdit;
  return { canEdit, canView };
}
