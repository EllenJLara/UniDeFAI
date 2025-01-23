import * as React from "react"
import { Dialog, DialogContent, DialogPortal, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface SheetProps extends React.ComponentProps<typeof Dialog> {
  children: React.ReactNode
}

interface SheetContentProps extends React.ComponentProps<typeof DialogContent> {
  children: React.ReactNode
  side?: "left" | "right" | "top" | "bottom"
  className?: string
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  className?: string
}

interface SheetDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  className?: string
}

const Sheet = ({ children, ...props }: SheetProps) => (
  <Dialog {...props}>{children}</Dialog>
)

const SheetTrigger = DialogTrigger

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  ({ side = "right", className, children, ...props }, ref) => (
    <DialogPortal>
      <DialogContent
        ref={ref}
        className={cn(
          "fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out",
          side === "right" && 
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" && 
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" && 
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto w-full border-b",
          side === "bottom" && 
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto w-full rounded-t-[10px] border-t",
          className
        )}
        {...props}
      >
        {children}
      </DialogContent>
    </DialogPortal>
  )
)
SheetContent.displayName = "SheetContent"

const SheetHeader = React.forwardRef<HTMLDivElement, SheetHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
      {...props}
    />
  )
)
SheetHeader.displayName = "SheetHeader"

const SheetTitle = React.forwardRef<HTMLHeadingElement, SheetTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
)
SheetTitle.displayName = "SheetTitle"

const SheetDescription = React.forwardRef<HTMLParagraphElement, SheetDescriptionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
)
SheetDescription.displayName = "SheetDescription"

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  type SheetProps,
  type SheetContentProps,
  type SheetHeaderProps,
  type SheetTitleProps,
  type SheetDescriptionProps,
}