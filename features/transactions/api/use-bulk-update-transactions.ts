import { InferRequestType, InferResponseType } from "hono";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { client } from "@/lib/hono";
import { toast } from "sonner";

type ResponseType = InferResponseType<
  (typeof client.api.transactions)["bulk-edit"]["$put"]
>;
type RequestType = InferRequestType<
  (typeof client.api.transactions)["bulk-edit"]["$put"]
>["json"];

export const useBulkUpdateTransactions = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async (json) => {
      const response = await client.api.transactions["bulk-edit"].$put({
        json,
      });
      return await response.json();
    },
    onSuccess: () => {
      toast.success("Transactions updated");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["summary"] });
    },
    onError: () => {
      toast.error("Failed to update transactions");
    },
  });

  return mutation;
};
