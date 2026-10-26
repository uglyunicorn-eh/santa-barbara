import React from "react";
import { X } from "react-feather";
import { useController, useFormState } from "react-hook-form";

import { FormFieldContext } from "@/components/forms/FormField";
import { cn } from "@/lib/utils";

// Email addresses as tags (the invite dialog): type or paste addresses; Enter, comma, semicolon, space or leaving the
// field turns each into a tag. Backspace in the empty field takes the last one back for editing, and × removes one.
// Repeats are dropped; addresses that don't look right stay, marked red, so they can be fixed. At most `max`.

const SEPARATORS = /[\s,;]+/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const looksLikeEmail = (value: string) => EMAIL.test(value);

type Props = {
  max: number;
  maxLength: number;
  placeholder?: string;
  autofocus?: boolean;
};

export const EmailTags = ({ max, maxLength, placeholder, autofocus }: Props) => {
  const { name, id, messageId, invalid } = React.useContext(FormFieldContext);
  const { field } = useController({ name });
  const { isSubmitting } = useFormState();
  const tags: string[] = field.value ?? [];
  const [draft, setDraft] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const full = tags.length >= max;

  React.useEffect(
    () => {
      if (autofocus) {
        const timer = setTimeout(() => inputRef.current?.focus(), 5);
        return () => clearTimeout(timer);
      }
    },
    [autofocus],
  );

  /** Adds the addresses in `text` (any separators), up to the limit; returns what didn't fit. */
  const add = (text: string) => {
    const next = [...tags];
    const seen = new Set(next.map(tag => tag.toLowerCase()));
    const words = text.split(SEPARATORS).map(word => word.trim()).filter(Boolean);
    let rest = "";
    for (const [index, word] of words.entries()) {
      if (next.length >= max) {
        rest = words.slice(index).join(" ");
        break;
      }
      if (!seen.has(word.toLowerCase())) {
        seen.add(word.toLowerCase());
        next.push(word.slice(0, maxLength));
      }
    }
    if (next.length !== tags.length) {
      field.onChange(next);
    }
    return rest;
  };

  const remove = (index: number) => {
    field.onChange(tags.filter((_, i) => i !== index));
    inputRef.current?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "," || e.key === ";" || e.key === " ") && draft.trim()) {
      e.preventDefault();
      setDraft(add(draft));
    } else if (e.key === "Backspace" && !draft && tags.length) {
      e.preventDefault();
      setDraft(tags[tags.length - 1]);
      field.onChange(tags.slice(0, -1));
    }
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("text");
    if (SEPARATORS.test(text.trim())) {
      e.preventDefault();
      setDraft(add(`${draft} ${text}`));
    }
  };

  const onBlur = () => {
    if (draft.trim()) {
      setDraft(add(draft));
    }
    field.onBlur();
  };

  return (
    <div
      className={cn(
        "flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-lg border bg-white px-2 py-1.5 transition-colors duration-150",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-white",
        invalid ? "border-destructive" : "border-input",
      )}
      onClick={() => inputRef.current?.focus()}
    >
      {tags.map((tag, index) => {
        const bad = !looksLikeEmail(tag);
        return (
          <span
            key={tag}
            className={cn(
              "inline-flex max-w-full items-center gap-1 rounded-full py-0.5 pr-1 pl-3 text-sm",
              bad ? "bg-red-50 text-destructive ring-1 ring-red-200" : "bg-teal-50 text-teal-900",
            )}
            title={bad ? "This doesn't look like an email address" : undefined}
          >
            <span className="truncate">{tag}</span>
            <button
              type="button"
              className="grid size-5 shrink-0 cursor-pointer place-items-center rounded-full hover:bg-black/10 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              aria-label={`Remove ${tag}`}
              disabled={isSubmitting}
              onClick={(e) => { e.stopPropagation(); remove(index); }}
            >
              <X size={14} aria-hidden="true" />
            </button>
          </span>
        );
      })}
      <input
        ref={inputRef}
        id={id}
        type="email"
        inputMode="email"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        className="h-7 min-w-32 flex-1 bg-transparent px-1 text-base text-zinc-900 outline-none placeholder:text-zinc-500 disabled:cursor-not-allowed"
        placeholder={full ? `That's ${max}, the most at once` : (tags.length ? "Add another…" : placeholder)}
        value={draft}
        maxLength={maxLength}
        disabled={full || isSubmitting}
        aria-invalid={invalid || undefined}
        aria-describedby={messageId}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={onBlur}
      />
    </div>
  );
};
