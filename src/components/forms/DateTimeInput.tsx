import React from "react";
import { Popover } from "@base-ui/react/popover";
import { useController, useFormState } from "react-hook-form";
import { Calendar, ChevronLeft, ChevronRight, Minus, Plus, X } from "react-feather";

import { Button } from "@/components/ui/button";
import { inputVariants } from "@/components/ui/input";
import { menuPositionerClass } from "@/components/ui/menu";
import { FormFieldContext } from "@/components/forms/FormField";
import { cn } from "@/lib/utils";

// A date and time field (docs/ui-kit.md, "Form fields"), in place of the browser's own datetime-local picker, which
// can't be styled. The field looks like the other inputs and shows the chosen moment in words; it opens a card with a
// month calendar and the time: a few chips for the usual times of day, and − / + in 15-minute steps. Days and times
// outside `min`…`max` can't be picked. The form's value is the same as a datetime-local input's: "2026-12-24T18:00",
// in this browser's time zone, or "" for none.

type Props = {
  /** The earliest and latest moments that can be picked. */
  min: Date;
  max: Date;
  placeholder?: string;
};

const STEP_MINUTES = 15;

/** The usual times of day, as chips; picking a day alone gives the evening. */
const TIMES_OF_DAY: { label: string; hour: number }[] = [
  { label: "Morning", hour: 9 },
  { label: "Noon", hour: 12 },
  { label: "Afternoon", hour: 15 },
  { label: "Evening", hour: 18 },
  { label: "Night", hour: 20 },
];
const DEFAULT_HOUR = 18;

const pad = (n: number) => String(n).padStart(2, "0");

/** A Date as the form's value: a datetime-local string in this browser's time zone. */
const toValue = (at: Date) =>
  `${at.getFullYear()}-${pad(at.getMonth() + 1)}-${pad(at.getDate())}T${pad(at.getHours())}:${pad(at.getMinutes())}`;

const fromValue = (value: unknown) => {
  if (typeof value !== "string" || !value) {
    return null;
  }
  const at = new Date(value);
  return Number.isNaN(at.getTime()) ? null : at;
};

const startOfDay = (at: Date) => new Date(at.getFullYear(), at.getMonth(), at.getDate());
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
const atTime = (day: Date, hours: number, minutes: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), hours, minutes);

/** The first moment on a STEP_MINUTES boundary at or after `at`. */
const roundUp = (at: Date) => {
  const step = STEP_MINUTES * 60_000;
  return new Date(Math.ceil(at.getTime() / step) * step);
};

/** Keeps a moment inside min…max, on a step boundary. */
const clamp = (at: Date, min: Date, max: Date) => {
  if (at < min) {
    return roundUp(min);
  }
  return at > max ? max : at;
};

/** The day the week starts on here (0 = Sunday), where the browser says; Sunday otherwise. */
const firstWeekday = () => {
  try {
    const locale = new Intl.Locale(navigator.language) as Intl.Locale & { getWeekInfo?: () => { firstDay: number }; weekInfo?: { firstDay: number } };
    const firstDay = locale.getWeekInfo?.().firstDay ?? locale.weekInfo?.firstDay;
    return firstDay ? firstDay % 7 : 0;
  } catch {
    return 0;
  }
};

const shownFormat = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
const shownFormatWithYear = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
const monthFormat = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const weekdayFormat = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const dayLabelFormat = new Intl.DateTimeFormat(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

/** The chosen moment in words: "Sat, Oct 31 · 6:00 PM", with the year when it isn't this year's. */
const describe = (at: Date) => (at.getFullYear() === new Date().getFullYear() ? shownFormat : shownFormatWithYear).format(at).replace(/,? (\d{1,2}:\d{2})/, " · $1");

/** The six weeks shown for a month, starting on the locale's first weekday. */
const monthGrid = (month: Date, weekStart: number) => {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const lead = (first.getDay() - weekStart + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => new Date(month.getFullYear(), month.getMonth(), 1 - lead + i));
};

export const DateTimeInput = ({ min, max, placeholder = "Pick a day and time" }: Props) => {
  const { name, id, messageId, invalid, size } = React.useContext(FormFieldContext);
  const { field } = useController({ name });
  const { isSubmitting } = useFormState();
  const value = fromValue(field.value);
  const [open, setOpen] = React.useState(false);
  const [month, setMonth] = React.useState(() => startOfDay(value ?? min));
  const weekStart = React.useMemo(firstWeekday, []);

  const firstMonth = new Date(min.getFullYear(), min.getMonth(), 1);
  const lastMonth = new Date(max.getFullYear(), max.getMonth(), 1);
  const shownMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const today = startOfDay(new Date());

  const set = (at: Date | null) => field.onChange(at ? toValue(clamp(at, min, max)) : "");

  const pickDay = (day: Date) => set(atTime(day, value?.getHours() ?? DEFAULT_HOUR, value?.getMinutes() ?? 0));
  const step = (minutes: number) => value && set(new Date(value.getTime() + minutes * 60_000));
  const dayOutOfRange = (day: Date) => atTime(day, 23, 59) < min || startOfDay(day) > max;

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setMonth(startOfDay(value ?? min));
    } else {
      // The form checks the field when it's left, as for any input.
      field.onBlur();
    }
  };

  const weekdays = Array.from({ length: 7 }, (_, i) => weekdayFormat.format(new Date(2026, 1, 1 + ((weekStart + i) % 7))));

  return (
    <Popover.Root open={open} onOpenChange={onOpenChange}>
      <div className="relative">
        <Popover.Trigger
          type="button"
          id={id}
          disabled={isSubmitting}
          aria-invalid={invalid || undefined}
          aria-describedby={messageId}
          className={cn(
            inputVariants({ size }),
            "flex cursor-pointer items-center gap-2 text-left disabled:cursor-not-allowed",
            value && "pr-10",
          )}
        >
          <Calendar size={18} aria-hidden="true" className="shrink-0 text-zinc-500" />
          <span className={cn("truncate", !value && "text-zinc-500")}>{value ? describe(value) : placeholder}</span>
        </Popover.Trigger>
        {value && !isSubmitting && (
          <button
            type="button"
            onClick={() => set(null)}
            aria-label="Clear"
            title="Clear"
            className="absolute top-1/2 right-2 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-ring"
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
      </div>

      <Popover.Portal>
        <Popover.Positioner className={menuPositionerClass} side="bottom" align="start" sideOffset={6} collisionPadding={12}>
          <Popover.Popup
            className="max-h-(--available-height) w-80 max-w-[calc(100vw-24px)] origin-(--transform-origin) overflow-y-auto rounded-card border border-border bg-white p-3 font-sans text-base text-zinc-900 shadow-lg outline-none transition-[opacity,scale] duration-150 [text-shadow:none] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0"
          >
            {/* The month, and the way to the ones before and after it (within min…max). */}
            <div className="mb-1 flex items-center justify-between">
              <Button
                type="button" variant="ghost" size="sm" className="size-8 px-0" aria-label="Previous month"
                disabled={shownMonth <= firstMonth}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>
              <Popover.Title className="text-base font-semibold" aria-live="polite">{monthFormat.format(month)}</Popover.Title>
              <Button
                type="button" variant="ghost" size="sm" className="size-8 px-0" aria-label="Next month"
                disabled={shownMonth >= lastMonth}
                onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
              >
                <ChevronRight size={18} aria-hidden="true" />
              </Button>
            </div>

            <div className="grid grid-cols-7 text-center">
              {weekdays.map((day, i) => <span key={i} className="pb-1 text-xs font-medium text-zinc-500" aria-hidden="true">{day}</span>)}
              {monthGrid(month, weekStart).map(day => {
                const outside = day.getMonth() !== month.getMonth();
                const disabled = dayOutOfRange(day);
                const chosen = value && sameDay(day, value);
                return (
                  <button
                    key={day.toISOString()}
                    type="button"
                    disabled={disabled}
                    onClick={() => pickDay(day)}
                    aria-label={dayLabelFormat.format(day)}
                    aria-pressed={chosen || undefined}
                    className={cn(
                      "mx-auto my-px flex size-8 cursor-pointer items-center justify-center rounded-full text-base transition-colors duration-150",
                      "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                      outside ? "text-zinc-400" : "text-zinc-900",
                      !chosen && !disabled && "hover:bg-zinc-100",
                      sameDay(day, today) && !chosen && "ring-1 ring-zinc-300",
                      chosen && "bg-primary font-semibold text-primary-foreground hover:bg-primary-hover",
                      disabled && "cursor-not-allowed text-zinc-300",
                    )}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>

            {/* The time: the usual times of day, then 15 minutes either way. */}
            <div className="mt-2 border-t border-border pt-2">
              <div className="flex justify-between gap-0.5">
                {TIMES_OF_DAY.map(({ label, hour }) => {
                  const at = value && atTime(value, hour, 0);
                  const chosen = value && value.getHours() === hour && value.getMinutes() === 0;
                  return (
                    <button
                      key={label}
                      type="button"
                      disabled={!at || at < min || at > max}
                      onClick={() => at && set(at)}
                      className={cn(
                        "cursor-pointer whitespace-nowrap rounded-full border px-1.5 py-0.5 text-[13px] transition-colors duration-150",
                        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                        chosen ? "border-primary bg-primary text-primary-foreground" : "border-border text-zinc-700 hover:bg-zinc-100",
                        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Button type="button" variant="secondary" size="sm" className="size-9 px-0" aria-label="15 minutes earlier"
                  disabled={!value || new Date(value.getTime() - STEP_MINUTES * 60_000) < min} onClick={() => step(-STEP_MINUTES)}>
                  <Minus size={16} aria-hidden="true" />
                </Button>
                <span className="text-2xl font-semibold tabular-nums" aria-live="polite">
                  {value ? timeFormat.format(value) : <span className="text-base font-normal text-zinc-500">Pick a day first</span>}
                </span>
                <Button type="button" variant="secondary" size="sm" className="size-9 px-0" aria-label="15 minutes later"
                  disabled={!value || new Date(value.getTime() + STEP_MINUTES * 60_000) > max} onClick={() => step(STEP_MINUTES)}>
                  <Plus size={16} aria-hidden="true" />
                </Button>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between">
              <Button type="button" variant="ghost" size="sm" disabled={!value} onClick={() => set(null)}>Clear</Button>
              <Popover.Close render={<Button type="button" variant="primary" size="sm" />}>Done</Popover.Close>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
