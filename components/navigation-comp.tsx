"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMedia } from "react-use";
import { Menu } from "lucide-react";
import qs from "query-string";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import NavButton from "@/components/nav-button";
import { Button } from "@/components/ui/button";
import { routes } from "@/contants/routes";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const isMobile = useMedia("(max-width: 1024px)", false);

  const createUrlWithParams = (href: string) => {
    const currentQueryParams = Object.fromEntries(searchParams.entries());

    const routeToNavigate = routes.find((route) => route.href === href);

    const persistQueryParams =
      routeToNavigate != null && routeToNavigate.persistParams === true;

    return qs.stringifyUrl(
      {
        url: href,
        query: persistQueryParams ? currentQueryParams : undefined,
      },
      { skipNull: true, skipEmptyString: true }
    );
  };

  const onNavigate = (href: string) => {
    const url = createUrlWithParams(href);

    router.push(url);
    setIsOpen(false);
  };

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="font-normal bg-white/10 hover:bg-white/20 hove:text-white border-none focus-visible:ring-offset-0 focus-visible:ring-transparent outline-none text-white focus:bg-white/30 transition"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="px-2">
          <nav className="flex flex-col gap-y-2 pt-6">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={pathname === route.href ? "secondary" : "ghost"}
                onClick={() => {
                  onNavigate(route.href);
                }}
                className="w-full justify-start"
              >
                {route.label}
              </Button>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <nav className="hidden lg:flex items-center gap-x-2 overflow-x-auto">
      {routes.map((route) => {
        return (
          <NavButton
            key={route.href}
            href={createUrlWithParams(route.href)}
            label={route.label}
            isActive={pathname === route.href}
          />
        );
      })}
    </nav>
  );
}

export default Navigation;
