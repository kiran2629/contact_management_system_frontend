import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps
>(
  (
    {
      options,
      selected,
      onChange,
      placeholder = "Select items...",
      className,
      disabled,
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleToggle = (option: string) => {
      if (selected.includes(option)) {
        onChange(selected.filter((item) => item !== option));
      } else {
        onChange([...selected, option]);
      }
    };

    const handleRemove = (option: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(selected.filter((item) => item !== option));
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "w-full justify-between text-left font-normal h-auto min-h-10",
              !selected.length && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <div className="flex flex-wrap gap-1 flex-1">
              {selected.length > 0 ? (
                selected.map((option) => (
                  <Badge
                    key={option}
                    variant="secondary"
                    className="mr-1 mb-1"
                    onClick={(e) => handleRemove(option, e)}
                  >
                    {option}
                    <button
                      className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleRemove(option, e as any);
                        }
                      }}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => handleRemove(option, e)}
                    >
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <div className="max-h-60 overflow-auto p-1">
            {options.map((option) => (
              <div
                key={option}
                className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
                onClick={() => handleToggle(option)}
              >
                <Checkbox
                  checked={selected.includes(option)}
                  onCheckedChange={() => handleToggle(option)}
                />
                <label className="flex-1 text-sm font-medium leading-none cursor-pointer">
                  {option}
                </label>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);
MultiSelect.displayName = "MultiSelect";
