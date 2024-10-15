export type FilterType = "AccountFilter" | "DateFilter";

export interface Route {
  href: string;
  label: string;
  welcomeMessage: string;
  filters: FilterType[];
  persistParams?: boolean;
}

export const routes: Route[] = [
  {
    href: "/",
    label: "Overview",
    welcomeMessage: "This is your financial report.",
    filters: ["AccountFilter", "DateFilter"],
    persistParams: true,
  },
  {
    href: "/transactions",
    label: "Transactions",
    welcomeMessage: "These are your transactions.",
    filters: ["AccountFilter", "DateFilter"],
    persistParams: true,
  },
  {
    href: "/accounts",
    label: "Accounts",
    welcomeMessage: "These are your accounts.",
    filters: ["AccountFilter"],
  },
  {
    href: "/categories",
    label: "Categories",
    welcomeMessage: "Here are your categories.",
    filters: [],
  },
  {
    href: "/settings",
    label: "Settings",
    welcomeMessage: "Customize your settings.",
    filters: [],
  },
];
