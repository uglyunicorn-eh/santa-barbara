import { Input as InputPrimitive } from "@base-ui/react/input";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

// Text inputs (docs/ui-kit.md, "Form fields"). `surface`: "light" for white cards, "dark" for the glass cards on photos
// (the sign-in and join boxes). Sizes match the buttons, so an input and its button line up.

const inputVariants = cva(
  [
    "w-full min-w-0 rounded-lg border font-sans outline-none transition-colors duration-150",
    "focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-3 text-base",
        lg: "h-12 px-4 text-lg",
      },
      surface: {
        light: [
          "border-input bg-white text-zinc-900 placeholder:text-zinc-500",
          "focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-offset-white",
          "aria-invalid:border-destructive disabled:bg-zinc-50 disabled:text-zinc-500",
        ],
        dark: [
          "border-white/30 bg-white/8 text-white placeholder:text-zinc-400",
          "focus-visible:border-white focus-visible:ring-white focus-visible:ring-offset-[#040102]",
          "aria-invalid:border-red-200 disabled:opacity-60",
        ],
      },
    },
    defaultVariants: {
      size: "md",
      surface: "light",
    },
  },
);

type InputProps = Omit<InputPrimitive.Props, "size"> & VariantProps<typeof inputVariants>;

function Input({ className, size, surface, ...props }: InputProps) {
  return <InputPrimitive data-slot="input" className={cn(inputVariants({ size, surface }), className)} {...props} />;
}

export { Input, inputVariants, type InputProps };
