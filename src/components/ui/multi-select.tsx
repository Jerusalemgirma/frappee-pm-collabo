"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Command as CommandPrimitive } from "cmdk"

type Option = Record<"value" | "label", string>;

interface MultiSelectProps extends React.InputHTMLAttributes<HTMLInputElement> {
  options: Option[];
  value: string[];
  onValueChange: (value: string[]) => void;
}

const MultiSelect = React.forwardRef<HTMLInputElement, MultiSelectProps>(({ options, value, onValueChange, ...props }, ref) => {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<Option[]>([]);
  const [inputValue, setInputValue] = React.useState("");

  React.useEffect(() => {
    if (Array.isArray(options)) {
      const selectedOptions = value.map(v => options.find(o => o.value === v)).filter(Boolean) as Option[];
      setSelected(selectedOptions);
    }
  }, [options, value]);

  React.useEffect(() => {
    onValueChange(selected.map(s => s.value));
  }, [selected, onValueChange]);

  const handleUnselect = (option: Option) => {
    setSelected(selected.filter((s) => s.value !== option.value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === "Backspace" || e.key === "Delete") && inputValue === "" && selected.length > 0) {
      setSelected(selected.slice(0, -1));
    }

    if (e.key === "Escape") {
      inputRef.current?.blur();
    }
  };
  
  if (!Array.isArray(options)) {
    return null; 
  }

  const selectables = options.filter(option => !selected.some(s => s.value === option.value));

  return (
    <Command onKeyDown={handleKeyDown} className="overflow-visible bg-transparent">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((option) => (
            <Badge key={option.value} variant="secondary">
              {option.label}
              <button
                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onClick={(e) => {
                  e.preventDefault();
                  handleUnselect(option);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => setOpen(false)}
            onFocus={() => setOpen(true)}
            placeholder="Select members..."
            className="ml-2 bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            {...props}
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0 ? (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandList>
              <CommandGroup className="h-full overflow-auto">
                {selectables.map((option) => (
                  <CommandItem
                    key={option.value}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onSelect={() => {
                      setInputValue("")
                      setSelected(prev => [...prev, option])
                    }}
                    className={"cursor-pointer"}
                  >
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </div>
        ) : null}
      </div>
    </Command>
  )
});

MultiSelect.displayName = "MultiSelect";

export { MultiSelect }; 