"use client";

import { Button } from "@/components/ui/button";
import { CardHeader, Card, CardContent, CardTitle } from "@/components/ui/card";
import { useNewAccountSheet } from "@/features/accounts/hooks/use-new-account-sheet";
import { Loader2, Plus } from "lucide-react";
import { DataTable } from "@/components/data-table";

import { columns } from "./columns";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Skeleton } from "@/components/ui/skeleton";
import { useBulkDeleteAccounts } from "@/features/accounts/api/use-bulk-delete-accounts";

const AccountsPage = () => {
  const { onOpen } = useNewAccountSheet();

  const deleteAccounts = useBulkDeleteAccounts();
  const accountsQuery = useGetAccounts();

  const isDisabled = accountsQuery.isLoading || deleteAccounts.isPending;

  const data = accountsQuery.data || [];

  if (accountsQuery.isLoading) {
    return (
      <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
        <Card className="border-none drop-shadow-sm">
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent>
            <div className="h-[500px] w-full flex items-center justify-center">
              <Loader2 className="size-6 text-slate-300 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">Accounts</CardTitle>
          <Button size="sm" onClick={onOpen}>
            <Plus className="size-4 mr-2" />
            Add New
          </Button>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            filterKey="name"
            disabled={isDisabled}
            onDelete={(rows) => {
              const ids = rows.map((r) => r.original.id);
              deleteAccounts.mutate({ ids });
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountsPage;
