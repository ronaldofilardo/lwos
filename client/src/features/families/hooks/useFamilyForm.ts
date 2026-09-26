import { useState } from "react";
import type { FamilyFormData } from "../types";

const initial: FamilyFormData = { name: "", civilStatus: "CASADO", maritalRegime: "CPB", notes: "" };

export function useFamilyForm(onSubmit: (data: FamilyFormData) => Promise<unknown>) {
  const [data, setData] = useState(initial);
  const [submitting, setSubmitting] = useState(false);
  const submit = async () => { setSubmitting(true); try { await onSubmit(data); setData(initial); } finally { setSubmitting(false); } };
  return { data, setData, submitting, submit };
}
