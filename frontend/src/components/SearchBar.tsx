interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <label className="search-shell">
      <span className="search-label">搜尋食譜</span>
      <input
        className="search-input"
        type="search"
        inputMode="search"
        placeholder="搜尋食譜、商品、分類或介紹"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
