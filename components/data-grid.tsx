"use client";

import DataCard, { DataCardLoading } from "@/components/data-card";
import { useGetSummary } from "@/features/summary/api/use-get-summary";
import { formatDateRange } from "@/lib/utils";
import { subDays } from "date-fns";
import { PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useSearchParams } from "next/navigation";

const DataGrid = () => {
  const { data, isLoading } = useGetSummary();
  const params = useSearchParams();

  const from = params.get("from") || "";
  const to = params.get("to") || "";

  const defaultTo = new Date();
  const defaultFrom = subDays(defaultTo, 30);

  const dateRangeLabel = formatDateRange({
    from: from ? new Date(`${from}:00:00:00`) : defaultFrom,
    to: to ? new Date(`${to}:00:00:00`) : defaultTo,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
        <DataCardLoading />
        <DataCardLoading />
        <DataCardLoading />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-2 mb-8">
      <DataCard
        title="Remaining"
        value={data?.remainingAmount}
        percentageChange={data?.remainingChange}
        icon={PiggyBank}
        variant="default"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Income"
        value={data?.incomeAmount}
        percentageChange={data?.incomeChange}
        icon={TrendingUp}
        variant="success"
        dateRange={dateRangeLabel}
      />
      <DataCard
        title="Expense"
        value={data?.expensesAmount}
        percentageChange={data?.expensesChange}
        icon={TrendingDown}
        variant="danger"
        dateRange={dateRangeLabel}
      />
    </div>
  );
};

export default DataGrid;
