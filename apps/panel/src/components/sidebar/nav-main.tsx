"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "#/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { QuickComposeModal } from "./quick-compose-modal";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loadingUrl, setLoadingUrl] = useState<string | null>(null);

  const isActiveUrl = (url: string) => {
    if (url === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(url);
  };

  // Clear loading state when navigation completes
  useEffect(() => {
    setLoadingUrl(null);
  }, [pathname]);

  const handleNavigation = (url: string) => {
    setLoadingUrl(url);
    router.push(url);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <QuickComposeModal>
              <SidebarMenuButton
                tooltip="Quick Compose"
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
              >
                <IconCirclePlusFilled />
                <span>Quick Compose</span>
              </SidebarMenuButton>
            </QuickComposeModal>
            <Button
              size="icon"
              className="size-8 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <IconMail />
              <span className="sr-only">Inbox</span>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => {
            const isLoading = loadingUrl === item.url;
            return (
              <SidebarMenuItem
                key={item.title}
                onClick={() => {
                  if (!isLoading) {
                    handleNavigation(item.url);
                  }
                }}
                className="cursor-pointer hover:underline hover:underline-offset-2"
              >
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActiveUrl(item.url)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    item.icon && <item.icon />
                  )}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
