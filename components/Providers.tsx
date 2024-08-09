import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";

function Providers({ children }: { children: ReactNode }) {
  return <ClerkProvider>{children}</ClerkProvider>;
}

export default Providers;
