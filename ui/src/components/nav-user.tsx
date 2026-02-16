"use client"

import { useState } from "react"
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
import { LogOut, EllipsisVertical, Info, Sparkles } from "lucide-react"
import { ToggleTheme } from './ui/toggle-theme'
import { Button } from './ui/button'
import { InfoDialog } from "./info-dialog"

export function NavUser({ analyseNowPlaying }: { analyseNowPlaying: () => void }) {
    const { isMobile } = useSidebar()
    const [showInfo, setShowInfo] = useState(false)
    const logout = () => {
        window.location.href = "/logout";
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem className="flex items-center justify-between gap-1 h-10">
                <Button
                    className="border h-10 gap-3 flex grow justify-start" 
                    onClick={analyseNowPlaying}
                    variant="outline"
                >
                    <Sparkles className="w-6 h-6" />
                    <span>Analyse now playing</span>
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <SidebarMenuButton
                            size="sm"
                            className="w-8 h-10 border data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-accent hover:text-sidebar-accent-foreground"
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
                        <DropdownMenuItem onSelect={() => setShowInfo(true)}>
                            <Info />
                            About
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={logout}>
                            <LogOut />
                            Log out
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
            <InfoDialog open={showInfo} onOpenChange={setShowInfo} />
        </SidebarMenu>
    )
}
