import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

interface Option {
  id: string;
  value: string;
  label: string;
}

interface SelectWrapperProps {
  options: Option[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  prefix?: string;
  className?: string;
}

export function SelectWrapper({
  options,
  value,
  onValueChange,
  placeholder,
  prefix = "select",
  className = "w-full"
}: SelectWrapperProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={className} aria-label={placeholder}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent 
        className="max-h-[200px] overflow-y-auto bg-white"
        position="popper"
        sideOffset={5}
      >
        {options.map((option) => (
          <SelectItem
            key={`${prefix}-${option.id}`}
            value={option.value}
            className="hover:bg-gray-100"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
