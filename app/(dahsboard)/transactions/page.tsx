"use client";
import { useState } from "react";
import { Loader2, Plus } from "lucide-react";

import { useBulkDeleteTransactions } from "@/features/transactions/api/use-bulk-delete-transactions";
import { useGetTransactions } from "@/features/transactions/api/use-get-transactions";
import { useSelectAccount } from "@/features/accounts/hooks/use-select-account";
import { useBulkCreateTransactions } from "@/features/transactions/api/use-bulk-create-transactions";
import { useBulkEditTransactionSheet } from "@/features/transactions/hooks/use-bulk-edit-transaction-sheet";
import { useNewTransactionSheet } from "@/features/transactions/hooks/use-new-transaction-sheet";

import { transactions } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { CardHeader, Card, CardContent, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/data-table";
import { Skeleton } from "@/components/ui/skeleton";

import UploadButton from "./upload-button";
import ImportCard from "./import-card";

import { columns } from "./columns";

enum VARIANTS {
  LIST = "LIST",
  IMPORT = "IMPORT",
}

const INITIAL_IMPORT_RESULTS = {
  data: [],
  errors: [],
  meta: [],
};

const TransactionsPage = () => {
  const [SelectAccountDialog, confirmSelectAccountDialog] = useSelectAccount();
  const [variant, setVariant] = useState<VARIANTS>(VARIANTS.LIST);
  const [importResults, setImportResults] = useState(INITIAL_IMPORT_RESULTS);

  const { onOpen } = useNewTransactionSheet();
  const { onOpen: onOpenBulkEditTransactions } = useBulkEditTransactionSheet();

  const bulkCreateMutation = useBulkCreateTransactions();
  const deleteTransactions = useBulkDeleteTransactions();
  const transactionQuery = useGetTransactions();

  const isDisabled = transactionQuery.isLoading || deleteTransactions.isPending;

  const data = transactionQuery.data || [];

  const onUpload = (results: typeof INITIAL_IMPORT_RESULTS) => {
    setImportResults(results);
    setVariant(VARIANTS.IMPORT);
  };

  const onCancelImport = () => {
    setImportResults(INITIAL_IMPORT_RESULTS);
    setVariant(VARIANTS.LIST);
  };

  const onSubmitImport = async (
    values: (typeof transactions.$inferInsert)[]
  ) => {
    const accountId = await confirmSelectAccountDialog();

    if (accountId == null) {
      return;
    }

    const data = values.map((value) => ({
      ...value,
      accountId: accountId as string,
    }));

    bulkCreateMutation.mutate(data, {
      onSuccess: () => {
        onCancelImport();
      },
    });
  };

  const onUpdateTransactions = () => {};

  if (transactionQuery.isLoading) {
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

  if (variant === VARIANTS.IMPORT) {
    return (
      <>
        <SelectAccountDialog />
        <ImportCard
          data={importResults.data}
          onCancel={onCancelImport}
          onSubmit={onSubmitImport}
        />
      </>
    );
  }

  return (
    <div className="max-w-screen-2xl mx-auto w-full pb-10 -mt-24">
      <Card className="border-none drop-shadow-sm">
        <CardHeader className="gap-y-2 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl line-clamp-1">
            Transactions History
          </CardTitle>
          <div className="flex flex-col lg:flex-row gap-y-2 items-center gap-x-2">
            <UploadButton onUpload={onUpload} />
            <Button size="sm" onClick={onOpen} className="w-full lg:w-auto">
              <Plus className="size-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={data}
            filterKey="payee"
            disabled={isDisabled}
            onDelete={(rows) => {
              const ids = rows.map((r) => r.original.id);
              deleteTransactions.mutate({ ids });
            }}
            onUpdate={(rows) => {
              const ids = rows.map((r) => r.original.id);
              onOpenBulkEditTransactions(ids);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionsPage;
