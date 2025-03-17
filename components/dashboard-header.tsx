"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DollarSign } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { useTranslations } from "@/lib/hooks/use-translations";
import { safeDBOperation } from "@/lib/db";
import { type TranslationKey } from "@/lib/translations";

export function DashboardHeader() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const { t } = useTranslations([
    "appTitle" as TranslationKey,
    "skipTranslation" as TranslationKey,
    "nav.settings" as TranslationKey,
    "auth.signOut" as TranslationKey,
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      if (!user) return;

      try {
        const result = await safeDBOperation(async (db) => {
          return await db.profiles.where({ userId: user.id }).first();
        });

        if (result.success && result.data && isMounted) {
          setName(result.data.fullName || "");
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [user?.id]); // Only re-run when user ID changes

  if (!mounted) {
    return null;
  }

  const displayName = name || user?.fullName || "";
  const displayInitial = displayName
    ? displayName.charAt(0).toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || "";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <DollarSign className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">
              {t("appTitle" as TranslationKey)}
            </span>
          </Link>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">
                {t("skipTranslation" as TranslationKey)}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{displayInitial}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  {displayName && (
                    <p className="text-sm font-medium leading-none">
                      {displayName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/settings")}>
                {t("nav.settings" as TranslationKey)}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => signOut()}
              >
                {t("auth.signOut" as TranslationKey)}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
