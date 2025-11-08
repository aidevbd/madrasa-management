import { useState } from "react";
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  ShoppingCart, 
  Receipt, 
  FileText, 
  Bell,
  BookOpen,
  Calendar,
  Settings,
  DollarSign
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "ড্যাশবোর্ড", url: "/", icon: LayoutDashboard },
  { title: "ছাত্র ব্যবস্থাপনা", url: "/students", icon: GraduationCap },
  { title: "স্টাফ ব্যবস্থাপনা", url: "/staff", icon: Users },
  { title: "বেতন ব্যবস্থাপনা", url: "/salaries", icon: DollarSign },
  { title: "উপস্থিতি", url: "/attendance", icon: Calendar },
  { title: "ফি ব্যবস্থাপনা", url: "/fees", icon: Receipt },
  { title: "বাজার খরচ", url: "/expenses", icon: ShoppingCart },
  { title: "হিসাব সারাংশ", url: "/accounting", icon: Receipt },
  { title: "রিপোর্ট", url: "/reports", icon: FileText },
  { title: "নোটিশ", url: "/notices", icon: Bell },
  { title: "ডকুমেন্ট", url: "/documents", icon: BookOpen },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary-foreground" />
          </div>
          {state !== "collapsed" && (
            <div>
              <h2 className="font-semibold text-sidebar-foreground">মাদ্রাসা ম্যানেজমেন্ট</h2>
              <p className="text-xs text-muted-foreground">সিস্টেম v1.0</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>প্রধান মেনু</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>সেটিংস</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="সেটিংস">
                  <NavLink to="/settings" className={getNavCls}>
                    <Settings className="w-4 h-4" />
                    <span>সেটিংস</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
