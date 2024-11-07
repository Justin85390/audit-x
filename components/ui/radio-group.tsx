import React from 'react';

type RadioGroupProps = {
  children: React.ReactNode;
  name: string;
  value: string;
  onChange: (value: string) => void;
};

export function RadioGroup({ children, name, value, onChange }: RadioGroupProps) {
  return (
    <div role="radiogroup">
      {React.Children.map(children, (child) =>
        React.isValidElement(child) && child.type === RadioGroupItem
          ? React.cloneElement(child as React.ReactElement<RadioGroupItemProps>, {
              name,
              selectedValue: value,
              onChange,
            })
          : child
      )}
    </div>
  );
}

type RadioGroupItemProps = {
  value: string;
  label: string;
  name?: string;
  selectedValue?: string;
  onChange?: (value: string) => void;
};

export function RadioGroupItem({ value, label, name, selectedValue, onChange }: RadioGroupItemProps) {
  return (
    <label className="flex items-center space-x-2">
      <input
        type="radio"
        name={name}
        value={value}
        checked={selectedValue === value}
        onChange={() => onChange && onChange(value)}
        className="form-radio"
      />
      <span>{label}</span>
    </label>
  );
}