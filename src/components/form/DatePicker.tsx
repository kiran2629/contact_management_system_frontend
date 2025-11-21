import * as React from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DatePickerProps {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  maxDate?: Date;
}

// Custom caption component with year and month navigation
const CustomCaption = ({
  displayMonth,
  onMonthChange,
  maxDate,
}: {
  displayMonth: Date;
  onMonthChange: (date: Date) => void;
  maxDate?: Date;
}) => {
  const currentYear = new Date().getFullYear();
  const minYear = maxDate ? maxDate.getFullYear() - 100 : currentYear - 100;
  const maxYear = maxDate ? maxDate.getFullYear() : currentYear;

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  ).reverse();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleYearChange = (year: string) => {
    const newDate = new Date(displayMonth);
    newDate.setFullYear(parseInt(year));
    // Ensure the date doesn't exceed maxDate
    if (maxDate && newDate > maxDate) {
      newDate.setTime(maxDate.getTime());
    }
    onMonthChange(newDate);
  };

  const handleMonthChange = (month: string) => {
    const monthIndex = months.indexOf(month);
    const newDate = new Date(displayMonth);
    newDate.setMonth(monthIndex);
    // Ensure the date doesn't exceed maxDate
    if (maxDate && newDate > maxDate) {
      newDate.setTime(maxDate.getTime());
    }
    onMonthChange(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(displayMonth.getMonth() - 1);
    if (!maxDate || newDate <= maxDate) {
      onMonthChange(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(displayMonth);
    newDate.setMonth(displayMonth.getMonth() + 1);
    if (!maxDate || newDate <= maxDate) {
      onMonthChange(newDate);
    }
  };

  const canGoPrevious =
    !maxDate ||
    (() => {
      const prevMonth = new Date(displayMonth);
      prevMonth.setMonth(displayMonth.getMonth() - 1);
      return prevMonth <= maxDate;
    })();

  const canGoNext =
    !maxDate ||
    (() => {
      const nextMonth = new Date(displayMonth);
      nextMonth.setMonth(displayMonth.getMonth() + 1);
      return nextMonth <= maxDate;
    })();

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={goToPreviousMonth}
          disabled={!canGoPrevious}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Select
            value={months[displayMonth.getMonth()]}
            onValueChange={handleMonthChange}
          >
            <SelectTrigger className="h-8 w-[120px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={displayMonth.getFullYear().toString()}
            onValueChange={handleYearChange}
          >
            <SelectTrigger className="h-8 w-[80px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[200px]">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={goToNextMonth}
          disabled={!canGoNext}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      date,
      onDateChange,
      placeholder = "Pick a date",
      className,
      disabled,
      maxDate,
    },
    ref
  ) => {
    const [month, setMonth] = React.useState<Date>(date || new Date());

    // Update month when date changes externally
    React.useEffect(() => {
      if (date) {
        setMonth(date);
      }
    }, [date]);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground",
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <CustomCaption
            displayMonth={month}
            onMonthChange={setMonth}
            maxDate={maxDate}
          />
          <Calendar
            mode="single"
            selected={date}
            onSelect={onDateChange}
            month={month}
            onMonthChange={setMonth}
            disabled={(date) => {
              if (maxDate) {
                return date > maxDate;
              }
              return false;
            }}
            initialFocus
            components={{
              Caption: () => null, // Hide default caption since we have custom one
            }}
            classNames={{
              months: "space-y-0",
              month: "space-y-0",
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = "DatePicker";
