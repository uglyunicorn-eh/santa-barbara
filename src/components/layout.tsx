import React from "react";

import { cn } from "@/lib/utils";

// The page layout pieces. Their base styles are in src/styles/layout.scss (so each screen's SCSS can adjust them);
// responsive visibility and text alignment are Tailwind utilities.

type Div = React.HTMLAttributes<HTMLDivElement>;
type Align = "left" | "centered" | "center" | "right";
type Breakpoint = "mobile" | "tablet" | "touch" | "desktop";

const alignClass: Record<Align, string> = { left: "text-left", centered: "text-center", center: "text-center", right: "text-right" };

/** Text alignment on a breakpoint: mobile (< 769px), tablet (769px and up), touch (< 1024px), desktop (1024px and up). */
const alignAt: Record<Breakpoint, Record<Align, string>> = {
  mobile: { left: "max-tablet:text-left", centered: "max-tablet:text-center", center: "max-tablet:text-center", right: "max-tablet:text-right" },
  tablet: { left: "tablet:text-left", centered: "tablet:text-center", center: "tablet:text-center", right: "tablet:text-right" },
  touch: { left: "max-desktop:text-left", centered: "max-desktop:text-center", center: "max-desktop:text-center", right: "max-desktop:text-right" },
  desktop: { left: "desktop:text-left", centered: "desktop:text-center", center: "desktop:text-center", right: "desktop:text-right" },
};

/** Hidden on a breakpoint. */
const hiddenAt: Record<Breakpoint, string> = {
  mobile: "max-tablet:hidden",
  tablet: "tablet:hidden",
  touch: "max-desktop:hidden",
  desktop: "desktop:hidden",
};

// ---------------------------------------------------------------------------------------------------------------

type HeroProps = Div & { size?: "fullheight" };

const HeroRoot = ({ size, className, ...props }: HeroProps) => (
  <section className={cn("hero", size === "fullheight" && "is-fullheight", className)} {...props} />
);

/** A full-height panel: header, body (centred) and footer. */
export const Hero = Object.assign(HeroRoot, {
  Header: ({ className, ...props }: Div) => <div className={cn("hero-head", className)} {...props} />,
  Body: ({ className, ...props }: Div) => <div className={cn("hero-body", className)} {...props} />,
  Footer: ({ className, ...props }: Div) => <div className={cn("hero-foot", className)} {...props} />,
});

/** The page's centred column: 960 / 1152 / 1344px wide from desktop. */
export const Container = ({ textAlign, className, ...props }: Div & { textAlign?: Align }) => (
  <div className={cn("container", textAlign && alignClass[textAlign], className)} {...props} />
);

/** Rich text: paragraphs, headings and lists with their spacing. */
export const Content = ({ textAlign, className, ...props }: Div & { textAlign?: Align }) => (
  <div className={cn("content", textAlign && alignClass[textAlign], className)} {...props} />
);

export const Section = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <section className={cn("section", className)} {...props} />
);

// ---------------------------------------------------------------------------------------------------------------

type ColumnsProps = Div & {
  vCentered?: boolean;
  /** From which width the columns sit side by side (below it they stack). */
  breakpoint?: "tablet" | "desktop";
};

const ColumnsRoot = ({ vCentered, breakpoint = "tablet", className, ...props }: ColumnsProps) => (
  <div className={cn("columns", vCentered && "is-vcentered", breakpoint === "desktop" && "is-desktop", className)} {...props} />
);

type Responsive = { display?: "hidden"; textAlign?: Align; size?: 5 };

type ColumnProps = Div & {
  size?: 1 | 5 | "one-third";
  narrow?: boolean;
  textAlign?: Align;
  mobile?: Responsive;
  tablet?: Responsive;
  touch?: Responsive;
  desktop?: Responsive;
};

const Column = ({ size, narrow, textAlign, mobile, tablet, touch, desktop, className, ...props }: ColumnProps) => {
  const at = { mobile, tablet, touch, desktop };
  return (
    <div
      className={cn(
        "column",
        size && `is-${size}`,
        narrow && "is-narrow",
        desktop?.size && `is-${desktop.size}-desktop`,
        textAlign && alignClass[textAlign],
        (Object.keys(at) as Breakpoint[]).flatMap(bp => [
          at[bp]?.display === "hidden" && hiddenAt[bp],
          at[bp]?.textAlign && alignAt[bp][at[bp]!.textAlign!],
        ]),
        className,
      )}
      {...props}
    />
  );
};

/** Columns side by side from tablet (or desktop), stacked below. */
export const Columns = Object.assign(ColumnsRoot, { Column });

// ---------------------------------------------------------------------------------------------------------------

export const Card = Object.assign(
  ({ className, ...props }: Div) => <div className={cn("card", className)} {...props} />,
  { Content: ({ className, ...props }: Div) => <div className={cn("card-content", className)} {...props} /> },
);

export const Message = Object.assign(
  ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => <article className={cn("message", className)} {...props} />,
  { Body: ({ className, ...props }: Div) => <div className={cn("message-body", className)} {...props} /> },
);

/** An illustration in a <figure> (the screen's styles size it). */
export const Image = ({ src, alt, className }: { src: string; alt: string; className?: string }) => (
  <figure className={cn("image", className)}><img src={src} alt={alt} /></figure>
);

export const PageFooter = ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
  <footer className={cn("footer", className)} {...props} />
);
