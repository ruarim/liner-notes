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
        window.location.href = "/logout";
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-between gap-1 h-10">
                <Toggle
                    className="border border h-10 gap-3 flex grow justify-start"
                    onPressedChange={setAnalyzing}
                    pressed={isAnalyzing}
                >
                    <EqVisualizer isPlaying={isAnalyzing} className="w-6 h-6" barCount={4} />
                    <span>Analyse now playing</span>
                </Toggle>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="sm"
                            className="w-8 h-10 border border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-accent hover:text-sidebar-accent-foreground"
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
