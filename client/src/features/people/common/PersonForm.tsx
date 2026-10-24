import { UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonIdentityFields } from "./PersonIdentityFields";
import { PersonSpouseFields } from "./PersonSpouseFields";
import { PersonContactFields } from "./PersonContactFields";
import { usePersonFormState } from "./usePersonFormState";
import type { PersonFormSubmit, PersonSummary } from "./personFormTypes";

export type { PersonFormSubmit, PersonSummary } from "./personFormTypes";

export function PersonForm({
  disabled,
  people = [],
  initial,
  isEdit = false,
  onSubmit,
}: {
  disabled: boolean;
  people?: PersonSummary[];
  initial?: Partial<PersonFormSubmit>;
  isEdit?: boolean;
  onSubmit: (data: PersonFormSubmit) => Promise<unknown>;
}) {
  const state = usePersonFormState({ initial, people });

  const submit = async () => {
    if (!state.canSubmit) return;
    await onSubmit(state.submitData);
    if (!isEdit) state.reset();
  };

  return (
    <div className="space-y-3">
      <PersonIdentityFields state={state} isEdit={isEdit} people={people} />
      <PersonSpouseFields state={state} />
      <PersonContactFields state={state} />
      <div className="flex justify-end">
        <Button
          className="w-full md:w-auto"
          disabled={disabled || !state.canSubmit}
          onClick={submit}
        >
          <UserPlus className="mr-2 size-4" />
          {isEdit ? "Salvar" : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}
