"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  Home,
  BarChart3,
  Layers,
  ShieldCheck,
  Users,
  Settings,
  LogOut,
  ChevronsUpDown,
  Building2
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuthMe } from "@/hooks/api/useAuth";
import { authService } from "@/lib/auth";

const mainNavItems = [
  { title: "Home", href: "/dashboard", icon: Home },
  { title: "Dev KPI", href: "/developers-kpi", icon: BarChart3 },
  { title: "Spaces", href: "/spaces", icon: Layers }
];

const securityNavItems = [
  { title: "Access", href: "/role-access", icon: ShieldCheck },
  { title: "Members", href: "/members", icon: Users },
  { title: "Settings", href: "/settings", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();
  const { data: authMe } = useAuthMe();
  const { state, setOpen } = useSidebar();

  const isWorkspaceDetail =
    pathname.startsWith("/spaces/") && pathname !== "/spaces";

  useEffect(() => {
    setOpen(!isWorkspaceDetail);
  }, [isWorkspaceDetail, setOpen]);

  const handleSidebarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isWorkspaceDetail || state !== "collapsed") return;
    const target = e.target as HTMLElement;
    if (target.closest("a, button, [role='button']")) return;
    setOpen(true);
  };

  const user = authMe?.user;
  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "";

  const activeTenant =
    authMe?.tenants?.find((t) => t.tenant?.id)?.tenant ??
    authMe?.tenants?.[0]?.tenant;
  const tenantName = activeTenant?.name ?? "Tenant 1";

  return (
    <Sidebar
      collapsible="icon"
      onClick={handleSidebarClick}
      className="border-none [&_[data-sidebar=sidebar]]:bg-[#3B82F6] [&_[data-sidebar=sidebar]]:text-white [&_[data-sidebar=sidebar]]:border-none [&_[data-sidebar=sidebar]]:rounded-xl
        [&_[data-sidebar=menu-button]]:text-white [&_[data-sidebar=menu-button]]:hover:bg-white/20 [&_[data-sidebar=menu-button]]:hover:text-white
        [&_[data-sidebar=menu-button][data-active]]:bg-white [&_[data-sidebar=menu-button][data-active]]:text-[#3B82F6]!
        [&_[data-sidebar=menu-button][data-active]]:hover:bg-white [&_[data-sidebar=menu-button][data-active]]:hover:text-[#3B82F6]!
     "
    >
      {/* Tenant Header */}
      <SidebarHeader className="px-4 py-5 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:py-3">
        <div className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0">
          <div className="flex size-8 items-center justify-center rounded bg-white/20 text-white">
            <Building2 className="size-4" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium leading-tight text-white">
              {tenantName}
            </span>
            <div className="mt-0.5 flex items-center gap-1">
              <span className="text-[10px] text-white/70">Subscription</span>
              <span className="rounded bg-white px-1 py-0.5 text-[9px] font-medium text-[#3B82F6]">
                Free
              </span>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Access & Security */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {securityNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    render={<Link href={item.href} />}
                  >
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer — User */}
      <SidebarFooter className=" px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/50">
            <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
              <Avatar className="size-8">
                <AvatarImage
                  src={user?.avatarUrl ?? ""}
                  alt={user?.fullName ?? ""}
                />
                <AvatarFallback className="bg-white/20 text-white text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium leading-tight text-white">
                  {user?.fullName ?? "User"}
                </span>
                <span className="text-xs text-white/70">Admin</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 text-white/70 group-data-[collapsible=icon]:hidden" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="start"
            sideOffset={8}
            className="w-56"
          >
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => authService.logout()}
            >
              <LogOut className="size-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
