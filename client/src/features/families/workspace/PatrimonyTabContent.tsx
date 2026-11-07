import { PatrimonySummary } from "../common/PatrimonySummary";
import { PropertyPanel } from "@/features/properties/PropertyPanel";
import { CompanyPanel } from "@/features/companies/CompanyPanel";
import { AssetsPanel } from "@/features/assets/AssetsPanel";

interface Props {
  familyId: string;
}

export function PatrimonyTabContent({ familyId }: Props) {
  return (
    <div className="space-y-6">
      <PatrimonySummary familyId={familyId} />
      <PropertyPanel familyId={familyId} />
      <CompanyPanel familyId={familyId} />
      <AssetsPanel familyId={familyId} />
    </div>
  );
}
