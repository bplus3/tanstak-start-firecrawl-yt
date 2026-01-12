"use client"

import {
  Bookmark,
  Compass,
  Frame,
  Import,
} from "lucide-react"

import { NavPrimary } from "@/components/app/nav-primary"
import { NavUser } from "@/components/app/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Link, linkOptions } from "@tanstack/react-router"
import { NavPrimaryProps, NavUserProps } from "@/lib/types"

const navItems: NavPrimaryProps['items'] = linkOptions([
  {
    title: "Items",
    to: "/dashboard/items",
    icon: Frame,
    activeOptions: {
      exact: true,
    },
  },
  {
    title: "Import",
    to: "/dashboard/import",
    icon: Import,
    activeOptions: {
      exact: false,
    },
  },
  {
    title: "Discover",
    to: "/dashboard/discover",
    icon: Compass,
    activeOptions: {
      exact: false,
    },
  },
])

export function AppSidebar({ user }: NavUserProps) {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        {/* <TeamSwitcher teams={data.teams} /> */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={
              <Link to="/dashboard">
                <div className="bg-sidebar-primary size-8 text-sidebar-primary-foreground flex aspect-square items-center justify-center rounded-md">
                  <Bookmark className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="font-medium">Recall</span>
                  <span className="text-xs">Your AI Knowledge Base</span>
                </div>
              </Link>
            } />
          </SidebarMenuItem>
        </SidebarMenu>  
      </SidebarHeader>
      <SidebarContent>
        <NavPrimary items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
