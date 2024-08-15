"use client";

import { Button } from "@/components/ui/button";
import { useNewAccountSheet } from "@/features/accounts/hooks/use-new-account-sheet";

export default function Dashboard() {
  const { onOpen } = useNewAccountSheet();

  return (
    <div>
      <Button onClick={onOpen}> Create Account</Button>
    </div>
  );
}
