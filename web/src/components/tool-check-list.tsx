import { CircleCheck } from "lucide-react";

export function ToolCheckList({
  heading,
  items,
}: {
  heading: string;
  items: string[];
}) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">{heading}</h2>
      <ul className="mt-4 space-y-3 text-sm leading-6 text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <CircleCheck
              aria-hidden="true"
              className="mt-1 size-4 shrink-0 text-[#087f5b]"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
