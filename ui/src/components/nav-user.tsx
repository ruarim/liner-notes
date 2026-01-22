"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from './ui/dropdown-menu'

import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from './ui/sidebar'
import { LogOut, EllipsisVertical } from "lucide-react"
import { ToggleTheme } from './ui/toggle-theme'
import { EqVisualizer } from './eq-visualizer'
import { Toggle } from './ui/toggle'

export function NavUser({
    isAnalyzing,
    setAnalyzing,
}: {
    isAnalyzing: boolean,
    setAnalyzing: (isAnalyzing: boolean) => void,
}) {
    const { isMobile } = useSidebar()
    const logout = () => {
        document.cookie = "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/";
        window.location.reload();
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-between gap-2 h-10">
                <Toggle
                    className="border border h-10 gap-3 flex grow justify-start"
                    onClick={() => setAnalyzing(!isAnalyzing)}
                >
                    <EqVisualizer isPlaying={isAnalyzing} className="w-6 h-6" barCount={4} />
                    <span>Analyse now playing</span>
                </Toggle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="sm"
                            className="w-8 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                        >
                            <EllipsisVertical className="ml-auto size-4" />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-36 rounded-lg"
                        side={isMobile ? "bottom" : "right"}
                        align="end"
                        sideOffset={4}
                    >
                        <ToggleTheme />
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={logout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
