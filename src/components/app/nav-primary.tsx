"use client"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Link } from "@tanstack/react-router"
import { NavPrimaryProps } from "@/lib/types"

export function NavPrimary({
  items,
}: NavPrimaryProps) {
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupContent> 
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton render={
              <Link to={item.to} activeProps={{ 'data-active': true }} activeOptions={item.activeOptions}>
                <item.icon />
                <span>{item.title}</span>
              </Link>
            } />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
