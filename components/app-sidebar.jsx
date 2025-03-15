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
import { useSession } from "next-auth/react";
import { TeamSwitcher } from "@/components/team-switcher";

export function AppSidebar({ ...props }) {
  const { data: session } = useSession();
  const data = {
    user: {
      name: session?.user?.name,
      email: session?.user?.email,
      avatar: session?.user?.image,
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
