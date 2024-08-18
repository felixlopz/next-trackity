import { useEditCategorySheet } from "@/features/categories/hooks/use-edit-category-sheet";
import { TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";
import { useEditTransactionSheet } from "@/features/transactions/hooks/use-edit-transaction-sheet";

type Props = {
  id: string;
  category: string | null;
  categoryId: string | null;
};

const CategoryColumn = ({ id, category, categoryId }: Props) => {
  const { onOpen: onOpenCategory } = useEditCategorySheet();
  const { onOpen: onOpenTransaction } = useEditTransactionSheet();

  const onClick = () => {
    if (categoryId) {
      onOpenCategory(categoryId);
    } else {
      onOpenTransaction(id);
    }
  };
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center cursor-pointer hover:underline",
        !category && "text-rose-500"
      )}
    >
      {!category && <TriangleAlert className="mr-2 size-4 shrink-0" />}
      {category || "Uncategorized"}
    </div>
  );
};

export default CategoryColumn;
