import { useState } from "react";
import type { UfBracketFormData } from "../types";

interface Props {
  initialData?: UfBracketFormData | null;
  onSave: (data: UfBracketFormData) => void;
  onClose: () => void;
}

export function useUfBracketForm({ initialData, onSave, onClose }: Props) {
  const [limitValue, setLimitValue] = useState(
    initialData ? String(initialData.limitValue) : "1000000"
  );
  const [rate, setRate] = useState(
    initialData ? String(initialData.rate) : "4"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bracketOrder: initialData?.bracketOrder ?? 1,
      limitValue: Math.max(0, parseFloat(limitValue) || 0),
      rate: Math.max(0, parseFloat(rate) || 0),
      accumulatedTax: 0,
      deductionValue: 0,
    });
    onClose();
  };

  return {
    limitValue,
    setLimitValue,
    rate,
    setRate,
    handleSubmit,
  };
}
