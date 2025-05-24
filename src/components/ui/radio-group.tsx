
import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & {
    large?: boolean;
    card?: boolean;
  }
>(({ className, large, card, ...props }, ref) => {
  if (card) {
    return (
      <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
          "relative w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm transition-all hover:bg-slate-50 hover:shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=checked]:border-primary data-[state=checked]:ring-1 data-[state=checked]:ring-primary",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between">
          <span className="font-medium">{props.value}</span>
          <RadioGroupPrimitive.Indicator className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
            <Circle className="h-3 w-3 fill-current text-white" />
          </RadioGroupPrimitive.Indicator>
        </div>
      </RadioGroupPrimitive.Item>
    );
  }

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        large ? "h-5 w-5" : "h-4 w-4",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className={cn("fill-current text-current", large ? "h-3 w-3" : "h-2.5 w-2.5")} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
