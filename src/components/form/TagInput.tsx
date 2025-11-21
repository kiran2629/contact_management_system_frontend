import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  (
    {
      tags,
      onChange,
      placeholder = "Type and press Enter to add tags",
      className,
      disabled,
    },
    ref
  ) => {
    const [inputValue, setInputValue] = React.useState("");

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag();
      } else if (
        e.key === "Backspace" &&
        inputValue === "" &&
        tags.length > 0
      ) {
        // Remove last tag when backspace is pressed on empty input
        removeTag(tags.length - 1);
      }
    };

    const addTag = () => {
      const trimmedValue = inputValue.trim();
      if (trimmedValue && !tags.includes(trimmedValue)) {
        onChange([...tags, trimmedValue]);
        setInputValue("");
      }
    };

    const removeTag = (index: number) => {
      onChange(tags.filter((_, i) => i !== index));
    };

    return (
      <div className={cn("space-y-2", className)}>
        <div className="flex flex-wrap gap-2 items-center min-h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
          {tags.map((tag, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="ml-1 rounded-full hover:bg-secondary-foreground/20 p-0.5 transition-colors"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Input
            ref={ref}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="flex-1 min-w-[120px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto"
            disabled={disabled}
          />
        </div>
        {tags.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Press Enter or comma to add a tag. Click X to remove.
          </p>
        )}
      </div>
    );
  }
);
TagInput.displayName = "TagInput";
