import Header from "@/components/header";
import React from "react";

interface Props {
  children: React.ReactNode;
  params: any;
}

const PageLayout: React.FC<Props> = ({ children, params }) => {
  return (
    <>
      <Header />
      <main className="px-3 lg:px-14">{children}</main>
    </>
  );
};

export default PageLayout;
