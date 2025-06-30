import * as React from "react";
import { Calendar } from "@/components/ui/calendar";

export interface DatePickerProps {
  value: Date | undefined;
  onChange: (date: Date | undefined) => void;
  disabled?: boolean;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, disabled }) => {
  return (
    <Calendar
      mode="single"
      selected={value}
      onSelect={onChange}
      disabled={disabled}
    />
  );
}; 