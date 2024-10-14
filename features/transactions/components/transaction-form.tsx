"use client";

import { z } from "zod";
import { Loader2, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertTransactionSchema } from "@/db/schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Select from "@/components/select";
import DatePicker from "@/components/date-picker";
import { Textarea } from "@/components/ui/textarea";
import AmountInput from "@/components/amount-input";
import { convertAmountToMiliunits } from "@/lib/utils";
import { CreateAccountResponseType200 } from "@/features/accounts/api/use-create-account";
import { CreateCategoryResponseType200 } from "@/features/categories/api/use-create-category";

const formSchema = z.object({
  date: z.coerce.date(),
  accountId: z.string(),
  categoryId: z.string().nullable().optional(),
  payee: z.string(),
  amount: z.string(),
  notes: z.string().nullable().optional(),
});

const apiSchema = insertTransactionSchema.omit({ id: true });

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof apiSchema>;

type Props = {
  id?: string;
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
  onDelete?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  accountOptions: { label: string; value: string }[];
  categoryOptions: { label: string; value: string }[];
  onCreateAccount: (
    name: string
  ) => Promise<CreateAccountResponseType200 | null>;
  onCreateCategory: (
    name: string
  ) => Promise<CreateCategoryResponseType200 | null>;
};

export const TransactionForm = ({
  id,
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
  isLoading,
  accountOptions,
  categoryOptions,
  onCreateAccount,
  onCreateCategory,
}: Props) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
  });

  const { setValue } = form;

  const handleSubmit = (values: FormValues) => {
    const amount = parseFloat(values.amount);
    const amountInMiliunits = convertAmountToMiliunits(amount);

    onSubmit({ ...values, amount: amountInMiliunits });
  };

  const handleDelete = () => {
    onDelete?.();
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
        <FormField
          name="date"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <DatePicker
                  value={field.value}
                  onChange={field.onChange}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="accountId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select an account"
                  value={field.value}
                  onChange={field.onChange}
                  options={accountOptions}
                  onCreate={async (value) => {
                    const result = await onCreateAccount(value);
                    if (result != null) {
                      setValue("accountId", result.data.id);
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="categoryId"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <FormControl>
                <Select
                  placeholder="Select a category"
                  value={field.value}
                  onChange={field.onChange}
                  options={categoryOptions}
                  onCreate={async (value) => {
                    const result = await onCreateCategory(value);
                    if (result != null) {
                      setValue("categoryId", result.data.id);
                    }
                  }}
                  disabled={disabled}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="payee"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payee</FormLabel>
              <FormControl>
                <Input
                  disabled={disabled}
                  placeholder="Add a payee"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="amount"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <AmountInput
                  {...field}
                  value={field.value}
                  disabled={disabled}
                  placeholder="0.00"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          name="notes"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  disabled={disabled}
                  placeholder="Add notes"
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button className="w-full" disabled={disabled}>
          {id ? "Save Changes" : "Create Transaction"}
          {isLoading && <Loader2 className="size-4 ml-2 animate-spin" />}
        </Button>
        {id != null ? (
          <Button
            type="button"
            disabled={disabled}
            onClick={handleDelete}
            className="w-full"
            variant="outline"
          >
            <Trash className="size-4" />
            <p className="ml-2">Delete transaction</p>
          </Button>
        ) : null}
      </form>
    </Form>
  );
};
