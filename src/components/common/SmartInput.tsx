import { useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { History, AlertTriangle } from "lucide-react";
import { useDataMemory, findSimilar, normalizeValue, type MemoryKey } from "@/hooks/useDataMemory";

interface SmartInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  /** Which remembered field group to suggest from. */
  memoryKey: MemoryKey | string;
  value: string;
  onValueChange: (value: string) => void;
  /** Warn when the typed value looks like an existing record. */
  warnDuplicate?: boolean;
  maxSuggestions?: number;
}

/**
 * Text input backed by the centralised data memory: suggests previously used
 * values as you type and flags near-duplicates of existing records.
 */
export function SmartInput({
  memoryKey,
  value,
  onValueChange,
  warnDuplicate,
  maxSuggestions = 8,
  className,
  ...props
}: SmartInputProps) {
  const [open, setOpen] = useState(false);
  const blurTimer = useRef<number>();
  const { data: options = [] } = useDataMemory(memoryKey);

  const matches = useMemo(() => {
    const q = normalizeValue(value || "");
    const list = q
      ? options.filter((o) => normalizeValue(o).includes(q) && normalizeValue(o) !== q)
      : options;
    return list.slice(0, maxSuggestions);
  }, [options, value, maxSuggestions]);

  const duplicate = warnDuplicate && value ? findSimilar(value, options) : undefined;
  const exact = value && options.some((o) => normalizeValue(o) === normalizeValue(value));

  return (
    <div className="relative">
      <Input
        {...props}
        value={value}
        className={cn(className)}
        autoComplete="off"
        onChange={(e) => {
          onValueChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          blurTimer.current = window.setTimeout(() => setOpen(false), 120);
        }}
      />

      {open && matches.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-border bg-popover py-1 shadow-lg">
          {matches.map((opt) => (
            <li key={opt}>
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-popover-foreground hover:bg-accent"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onValueChange(opt);
                  setOpen(false);
                  window.clearTimeout(blurTimer.current);
                }}
              >
                <History className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{opt}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {duplicate && (
        <p className="mt-1 flex items-center gap-1 text-xs text-destructive">
          <AlertTriangle className="h-3 w-3" /> Similar record exists: {duplicate}
        </p>
      )}
      {!duplicate && warnDuplicate && exact && (
        <p className="mt-1 text-xs text-muted-foreground">Matches an existing record.</p>
      )}
    </div>
  );
}
