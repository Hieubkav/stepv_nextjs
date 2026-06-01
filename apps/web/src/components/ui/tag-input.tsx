"use client";

import type { KeyboardEvent } from "react";
import React, { useCallback, useMemo, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagInputProps {
  value: string; // Comma-separated string
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({ value, onChange, placeholder = "Nhập và Enter...", className }: TagInputProps) {
  const [inputValue, setInputValue] = useState("");

  // Parse comma-separated string to array
  const tags = useMemo(() => (
    value
      ? value.split(",").map(t => t.trim()).filter(Boolean)
      : []
  ), [value]);

  const addTag = useCallback((tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    
    // Check duplicate
    if (tags.some(t => t.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue("");
      return;
    }

    const newTags = [...tags, trimmed];
    onChange(newTags.join(", "));
    setInputValue("");
  }, [tags, onChange]);

  const removeTag = useCallback((index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onChange(newTags.join(", "));
  }, [tags, onChange]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 p-2 min-h-[42px] rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all",
        className
      )}
    >
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded-full"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            className="p-0.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 transition-colors text-indigo-400 hover:text-indigo-600"
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(inputValue)}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-0 focus:outline-none"
      />
    </div>
  );
}
