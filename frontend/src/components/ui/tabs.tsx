
import * as React from "react"

// Note: Since we don't have radix-ui installed (presumably), we need a simple implementation.
// However, if we assume shadcn dependencies, we'd use radix.
// Let's make a simple controlled Tabs component for now to avoid dependency errors.

import { cn } from "@/utils/cn"

const Tabs = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { defaultValue?: string; onValueChange?: (value: string) => void }
>(({ className, defaultValue, onValueChange, children, ...props }, ref) => {
    const [value, setValue] = React.useState(defaultValue);

    // Context needs to be passed down manually in simple implementation without context api
    // But for simplicity, let's just render children. 
    // Real implementation requires context. Here we cheat a bit for display only if not interactive.
    // ACTUALLY, implementing a simple context for tabs is better.

    return (
        <TabsContext.Provider value={{ value, setValue: (v) => { setValue(v); onValueChange?.(v); } }}>
            <div ref={ref} className={cn("", className)} {...props}>
                {children}
            </div>
        </TabsContext.Provider>
    )
})
Tabs.displayName = "Tabs"

const TabsContext = React.createContext<{ value?: string; setValue: (v: string) => void } | null>(null);

const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={cn(
            "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
            className
        )}
        role="tablist"
        {...props}
    />
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement> & { value: string }
>(({ className, value, onClick, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    const isActive = context?.value === value;
    return (
        <button
            ref={ref}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive && "bg-background text-foreground shadow-sm",
                className
            )}
            onClick={(e) => {
                context?.setValue(value);
                onClick?.(e);
            }}
            {...props}
        />
    )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, children, ...props }, ref) => {
    const context = React.useContext(TabsContext);
    if (context?.value !== value) return null;
    return (
        <div
            ref={ref}
            className={cn(
                "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }
