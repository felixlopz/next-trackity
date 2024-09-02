import { TransactionForm } from "@/features/transactions/components/transaction-form";
import { useNewTransactionSheet } from "@/features/transactions/hooks/use-new-transaction-sheet";
import { useCreateTransaction } from "@/features/transactions/api/use-create-transaction";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { insertTransactionSchema } from "@/db/schema";
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

const formSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;

export const NewTransactionSheet = () => {
  const { isOpen, onClose } = useNewTransactionSheet();

  const transactionMutation = useCreateTransaction();

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
    transactionMutation.isPending ||
    categoryMutation.isPending ||
    accountMutation.isPending;

  const isLoading = categoryQuery.isLoading || accountQuery.isLoading;

  const onSubmit = (values: FormValues) => {
    transactionMutation.mutate(values, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="space-y-4">
        <SheetHeader>
          <SheetTitle>New Transaction</SheetTitle>
          <SheetDescription>
            Create a new transaction to track your transactions
          </SheetDescription>
        </SheetHeader>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="size-4 text-muted-foreground animate-spin" />
          </div>
        ) : (
          <TransactionForm
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
