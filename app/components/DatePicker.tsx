"use client";

import { Calendar } from "@/components/ui/calendar";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
}

export default function DatePicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : undefined;

  return (
    <Calendar
      mode="single"
      selected={selected}
      onSelect={(date) => {
        if (!date) { onChange(""); return; }
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, "0");
        const dd = String(date.getDate()).padStart(2, "0");
        onChange(`${yyyy}-${mm}-${dd}`);
      }}
      disabled={{ after: today }}
    />
  );
}
