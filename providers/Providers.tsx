import { ClerkProvider } from "@clerk/nextjs";
import { ReactNode } from "react";
import { ReactQueryProvider } from "./ReactQuery";

function Providers({ children }: { children: ReactNode }) {
  return (
    <ReactQueryProvider>
      <ClerkProvider>{children}</ClerkProvider>
    </ReactQueryProvider>
  );
}

export default Providers;
