import { BulkTransactionForm } from "@/features/transactions/components/bulk-transaction-form";
import { useBulkEditTransactionSheet } from "@/features/transactions/hooks/use-bulk-edit-transaction-sheet";
import { useBulkUpdateTransactions } from "@/features/transactions/api/use-bulk-update-transactions";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { z } from "zod";
import {
  CreateCategoryResponseType200,
  useCreateCategory,
} from "@/features/categories/api/use-create-category";
import { useGetCategories } from "@/features/categories/api/use-get-categories";
import {
  CreateAccountResponseType200,
  useCreateAccount,
} from "@/features/accounts/api/use-create-account";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";
import { Loader2 } from "lucide-react";

export const formSchema = z.object({
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
});

export const bulkTransactionUpdateRequestSchema = formSchema;

type FormValues = z.input<typeof formSchema>;

export const BulkEditTransactionSheet = () => {
  const { isOpen, onClose, ids } = useBulkEditTransactionSheet();

  const bulkUpdateTransactionMutation = useBulkUpdateTransactions();

  const categoryMutation = useCreateCategory();
  const categoryQuery = useGetCategories();
  const onCreateCategory = async (
    name: string
  ): Promise<CreateCategoryResponseType200 | null> => {
    try {
      // NOTE: using any because of the weird returning type of mutateAsync
      return (await categoryMutation.mutateAsync({ name })) as any;
    } catch (error) {}

    return null;
  };
  const categoryOptions = (categoryQuery.data ?? []).map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const accountMutation = useCreateAccount();
  const accountQuery = useGetAccounts();
  const onCreateAccount = async (
    name: string
  ): Promise<CreateAccountResponseType200 | null> => {
    try {
      // NOTE: using any because of the weird returning type of mutateAsync
      return (await accountMutation.mutateAsync({ name })) as any;
    } catch (error) {}
    return null;
  };

  const accountOptions = (accountQuery.data ?? []).map((account) => ({
    label: account.name,
    value: account.id,
  }));

  const isPending =
    bulkUpdateTransactionMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const onSubmit = (fields: FormValues) => {
    bulkUpdateTransactionMutation.mutate(
      { ids, fields },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>
            Edit selected transactions {ids != null ? `(${ids.length})` : ""}
          </SheetTitle>
          <SheetDescription>
            Edit category or accounts from selected transactions
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <BulkTransactionForm
            onSubmit={onSubmit}
            disabled={isPending}
            isLoading={isPending}
            categoryOptions={categoryOptions}
            onCreateCategory={onCreateCategory}
            accountOptions={accountOptions}
            onCreateAccount={onCreateAccount}
          />
        )}
      </SheetContent>
    </Sheet>
  );
};
