"use client";

import { z } from "zod";
import { Loader2, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import Select from "@/components/select";
import { Textarea } from "@/components/ui/textarea";
import { CreateAccountResponseType200 } from "@/features/accounts/api/use-create-account";
import { CreateCategoryResponseType200 } from "@/features/categories/api/use-create-category";
import { formSchema } from "./bulk-edit-transaction-sheet";

type FormValues = z.input<typeof formSchema>;
type ApiFormValues = z.input<typeof formSchema>;

type Props = {
  defaultValues?: FormValues;
  onSubmit: (values: ApiFormValues) => void;
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

export const BulkTransactionForm = ({
  defaultValues,
  onSubmit,
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
    onSubmit({ ...values });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 pt-4"
      >
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
          Update Transactions
          {isLoading && <Loader2 className="size-4 ml-2 animate-spin" />}
        </Button>
      </form>
    </Form>
  );
};
