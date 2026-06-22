"use client";

import { useState, useEffect, useRef } from "react";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  onClose: () => void;
}

export default function DatePicker({ value, onChange, onClose }: DatePickerProps) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const ref = useRef<HTMLDivElement>(null);

  const selectedDate = value ? new Date(value + "T00:00:00") : null;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
  }

  function buildCalendar() {
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInPrevMonth = getDaysInMonth(viewYear, viewMonth - 1);
    const cells: { day: number; month: "prev" | "current" | "next" }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({ day: daysInPrevMonth - i, month: "prev" });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      cells.push({ day: i, month: "current" });
    }
    for (let i = 1; i <= 42 - cells.length; i++) {
      cells.push({ day: i, month: "next" });
    }
    return cells;
  }

  function handleDayClick(cell: { day: number; month: "prev" | "current" | "next" }) {
    let year = viewYear;
    let month = viewMonth;
    if (cell.month === "prev") { month--; if (month < 0) { month = 11; year--; } }
    if (cell.month === "next") { month++; if (month > 11) { month = 0; year++; } }

    const date = new Date(year, month, cell.day);
    if (date > today) return;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    onClose();
  }

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }

  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function handleToday() {
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    onChange(`${yyyy}-${mm}-${dd}`);
    onClose();
  }

  const cells = buildCalendar();

  return (
    <div
      ref={ref}
      className="absolute top-full mt-2 left-0 z-30 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-5 w-72"
    >
      {/* Month nav */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={prevMonth} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-bold text-white">{MONTHS[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="text-zinc-400 hover:text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs text-zinc-500 font-medium py-1">{d}</div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {cells.map((cell, i) => {
          const isCurrentMonth = cell.month === "current";
          const date = new Date(
            cell.month === "prev" ? (viewMonth === 0 ? viewYear - 1 : viewYear) : cell.month === "next" ? (viewMonth === 11 ? viewYear + 1 : viewYear) : viewYear,
            cell.month === "prev" ? (viewMonth === 0 ? 11 : viewMonth - 1) : cell.month === "next" ? (viewMonth === 11 ? 0 : viewMonth + 1) : viewMonth,
            cell.day
          );
          const isFuture = date > today;
          const isSelected = selectedDate &&
            date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === today.toDateString();

          return (
            <button
              key={i}
              onClick={() => !isFuture && handleDayClick(cell)}
              disabled={isFuture}
              className={`text-center text-sm py-2 rounded-lg transition-colors
                ${isSelected
                  ? "bg-sky-500 text-white font-semibold"
                  : isToday && isCurrentMonth
                  ? "text-sky-400 font-semibold hover:bg-zinc-800"
                  : !isCurrentMonth || isFuture
                  ? "text-zinc-700 cursor-default"
                  : "text-zinc-300 hover:bg-zinc-800"}
              `}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={handleToday}
          className="flex-1 bg-sky-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-sky-400 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => { onChange(""); onClose(); }}
          className="flex-1 bg-transparent border border-zinc-700 text-zinc-300 text-sm font-semibold py-2.5 rounded-xl hover:bg-zinc-800 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
