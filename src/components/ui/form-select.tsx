"use client";

import { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";
import { cn } from "@/lib/utils";

const EMPTY_VALUE = "__sudo_empty_value__";

export type FormSelectOption = {
  value: string;
  label: string;
  swatch?: string;
};

export function FormSelect({
  id,
  name,
  defaultValue,
  options,
  className,
}: {
  id: string;
  name: string;
  defaultValue: string;
  options: FormSelectOption[];
  className?: string;
}) {
  const [value, setValue] = useState(defaultValue || EMPTY_VALUE);
  const normalizedOptions = options.map((option) => ({
    ...option,
    value: option.value || EMPTY_VALUE,
  }));

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={value === EMPTY_VALUE ? "" : value}
      />
      <Select.Root value={value} onValueChange={setValue}>
        <Select.Trigger
          id={id}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-md border border-[#323334] bg-[#161718] px-3 text-left text-sm text-[#d0d6e0] outline-none transition duration-150 hover:border-[#45474d] hover:bg-[#1a1b1d] focus-visible:border-[#5e6ad2] focus-visible:ring-2 focus-visible:ring-[#5e6ad2]/20 data-[state=open]:border-[#5e6ad2] data-[state=open]:bg-[#1a1b1d] data-[state=open]:ring-2 data-[state=open]:ring-[#5e6ad2]/15 [&[data-state=open]_svg]:rotate-180",
            className,
          )}
        >
          <Select.Value />
          <Select.Icon asChild>
            <ChevronDown
              className="size-3.5 shrink-0 text-[#8a8f98] transition-transform duration-150"
              aria-hidden="true"
            />
          </Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content
            position="popper"
            sideOffset={6}
            align="start"
            className="z-[80] min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-[#323334] bg-[#161718] p-1 text-[#d0d6e0] shadow-[0_18px_48px_rgb(0_0_0_/_48%),0_1px_0_rgb(255_255_255_/_5%)_inset]"
          >
            <Select.Viewport>
              {normalizedOptions.map((option) => (
                <Select.Item
                  key={option.value}
                  value={option.value}
                  className="relative flex h-8 cursor-default select-none items-center rounded-[4px] py-1 pl-8 pr-2 text-sm outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:opacity-45 data-[highlighted]:bg-[#23252a] data-[highlighted]:text-[#f7f8f8]"
                >
                  <Select.ItemIndicator className="absolute left-2.5 inline-flex size-3.5 items-center justify-center text-[#8f99ff]">
                    <Check className="size-3.5" aria-hidden="true" />
                  </Select.ItemIndicator>
                  <Select.ItemText>
                    <span className="flex items-center gap-2">
                      {option.swatch ? (
                        <span
                          className="size-1.5 shrink-0 rounded-full shadow-[0_0_0_2px_rgb(255_255_255_/_4%)]"
                          style={{ backgroundColor: option.swatch }}
                          aria-hidden="true"
                        />
                      ) : null}
                      {option.label}
                    </span>
                  </Select.ItemText>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </>
  );
}
