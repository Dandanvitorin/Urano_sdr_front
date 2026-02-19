import { Star } from "lucide-react";

interface Props {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 16 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star === value ? 0 : star)}
          className="transition-colors hover:scale-110"
        >
          <Star
            className={star <= value ? "text-warning fill-warning" : "text-text-xdim"}
            size={size}
          />
        </button>
      ))}
    </div>
  );
}
