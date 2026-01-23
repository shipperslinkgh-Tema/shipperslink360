import { OfficeAccount } from "@/types/finance";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, Wallet, Smartphone, PiggyBank, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AccountsTableProps {
  accounts: OfficeAccount[];
}

const accountTypeIcons = {
  current: Building2,
  savings: PiggyBank,
  petty_cash: Wallet,
  mobile_money: Smartphone,
};

const accountTypeLabels = {
  current: "Current",
  savings: "Savings",
  petty_cash: "Petty Cash",
  mobile_money: "Mobile Money",
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  frozen: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function AccountsTable({ accounts }: AccountsTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-GH", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Account</TableHead>
          <TableHead>Bank</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Last Transaction</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {accounts.map((account) => {
          const Icon = accountTypeIcons[account.accountType];
          return (
            <TableRow key={account.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{account.accountName}</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {account.accountNumber}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{account.bankName}</TableCell>
              <TableCell>
                <Badge variant="outline">{accountTypeLabels[account.accountType]}</Badge>
              </TableCell>
              <TableCell>
                <span className="font-semibold">
                  {formatCurrency(account.balance, account.currency)}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground">{account.lastTransaction}</TableCell>
              <TableCell>
                <Badge className={statusColors[account.status]}>
                  {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Transactions</DropdownMenuItem>
                    <DropdownMenuItem>Transfer Funds</DropdownMenuItem>
                    <DropdownMenuItem>Edit Account</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
