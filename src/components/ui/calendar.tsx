"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4 bg-white/50 backdrop-blur-sm rounded-[2rem]", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-6",
        caption: "flex justify-center pt-2 relative items-center mb-2",
        caption_label: "text-sm font-black uppercase tracking-[0.2em] text-pink-600",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          "h-9 w-9 bg-pink-50/50 p-0 flex items-center justify-center text-pink-500 rounded-xl hover:bg-pink-100 hover:text-pink-600 transition-all border-none"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex mb-2",
        head_cell:
          "text-pink-300 rounded-md w-10 font-black text-[10px] uppercase tracking-widest",
        row: "flex w-full mt-1",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-transparent",
          "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
        ),
        day: cn(
          "h-10 w-10 p-0 font-bold text-[11px] rounded-2xl transition-all duration-300",
          "text-slate-500 hover:bg-pink-50 hover:text-pink-500 hover:scale-110"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "!bg-gradient-to-br !from-pink-500 !to-rose-400 !text-white hover:!from-pink-600 hover:!to-rose-500 focus:!from-pink-500 focus:!to-rose-400 !opacity-100 shadow-lg shadow-pink-200/50 scale-110 z-10",
        day_today: "bg-pink-50 text-pink-600 font-black ring-2 ring-pink-100 ring-offset-2",
        day_outside:
          "day-outside text-slate-200 opacity-50 aria-selected:bg-pink-50/50 aria-selected:text-slate-400 aria-selected:opacity-30",
        day_disabled: "text-slate-200 opacity-30 cursor-not-allowed",
        day_range_middle:
          "aria-selected:bg-pink-50 aria-selected:text-pink-900",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-5 w-5" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-5 w-5" />,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };