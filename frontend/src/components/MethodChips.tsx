import { METHOD_OPTIONS, MethodFilter } from "../types";

interface MethodChipsProps {
  selected: MethodFilter;
  onSelect: (value: MethodFilter) => void;
}

export function MethodChips({ selected, onSelect }: MethodChipsProps) {
  return (
    <div className="chip-row" aria-label="料理方式篩選">
      {METHOD_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          className={option === selected ? "chip chip-active" : "chip"}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
