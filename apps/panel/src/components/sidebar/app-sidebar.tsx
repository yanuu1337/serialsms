"use client";

import * as React from "react";
import {
  IconDashboard,
  IconMessageCircle,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "#/components/sidebar/nav-main";
import { NavUser } from "#/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Main page",
      url: "/dashboard/home",
      icon: IconDashboard,
    },
  ],

  navSecondary: [
    {
      title: "Account Settings",
      url: "/dashboard/account-settings",
      icon: IconSettings,
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconMessageCircle className="!size-5" />
                <span className="text-base font-semibold">SerialSMS</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={props.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
