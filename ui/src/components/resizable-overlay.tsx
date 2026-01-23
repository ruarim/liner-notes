import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { useSidebar } from "./ui/sidebar";

export function ResizableOverlay({
    defaultWidthPx,
    minWidthPx,
    maxWidthPx,
    children,
    isOpen,
    onOpenChange
}: {
    defaultWidthPx: number,
    minWidthPx: number,
    maxWidthPx: number,
    children: React.ReactNode,
    isOpen: boolean,
    onOpenChange: (isOpen: boolean) => void
}) {
    const { isMobile } = useSidebar()
    const [widthPx, setWidthPx] = useState(isMobile ? (window.innerWidth * 0.9) : defaultWidthPx);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && isMobile) {
            setWidthPx(window.innerWidth);
        } 
        else if (isOpen && widthPx > maxWidthPx) {
            setWidthPx(maxWidthPx);
        }
    }, [isOpen, isMobile, maxWidthPx, widthPx]);

    useEffect(() => {
        const handleMove = (clientX: number) => {
            if (!isResizing) return;

            const newWidth = window.innerWidth - clientX;
            const maxWidth = isMobile ? (window.innerWidth) : maxWidthPx;
            const minWidth = isMobile ? (window.innerWidth * 0.1) : minWidthPx;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                setWidthPx(newWidth);
            }
        };

        const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
        const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

        const handleEnd = () => {
            setIsResizing(false);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleEnd);
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleEnd);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleEnd);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleEnd);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, [isResizing, isMobile, minWidthPx, maxWidthPx]);

    if (!isOpen) return <></>

    return (
        <div
            ref={sidebarRef}
            className="absolute right-0 top-0 bottom-0 z-20 flex bg-background border-l shadow-xl transition-all duration-75 ease-out"
            style={{ width: `${widthPx}px` }}
        >
            {/* Resize Handle */}
            <div
                className={cn(
                    "flex w-4 -ml-2 items-center justify-center cursor-col-resize z-30 group hover:bg-accent/50 transition-colors",
                    isResizing && "bg-accent"
                )}
                onMouseDown={() => setIsResizing(true)}
                onTouchStart={() => setIsResizing(true)}
            >
                <div className="w-1 h-8 bg-border rounded-full group-hover:bg-primary/50 transition-colors" />
            </div>

            {/* Content Container */}
            <div className="flex-1 flex flex-col h-full overflow-hidden bg-background/95 backdrop-blur-sm">
                <div className="absolute top-2 right-2 z-10">
                    <Button
                        onClick={() => onOpenChange(false)}
                        size="icon"
                        variant="ghost"
                        title="Hide Graph"
                    >
                        ✕
                    </Button>
                </div>
                <div className="flex-1 overflow-auto">
                    <div className="flex h-full items-center justify-center">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
