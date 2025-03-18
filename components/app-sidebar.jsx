"use client";

import * as React from "react";
import { Truck, Store, Settings2, LayoutDashboard, Database } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "@/components/team-switcher";
import { useSession } from "@/context/SessionContext";
import { ModeToggle } from "./mode-toggle";

export function AppSidebar({ ...props }) {
  const { user } = useSession();
  const data = {
    user: {
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
    },
    teams: [
      {
        name: "Agora",
        logo: Store,
      },
    ],
    navMain: [
      {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
      },
      {
        title: "Products",
        url: "/products",
        icon: Database,
      },
      {
        title: "Orders",
        url: "/orders",
        icon: Truck,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings2,
      },
    ],
  };
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <ModeToggle/>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
