type StakeholderSummary = {
  id: string;
  displayName: string | null;
  percentage: string | number;
};

export function CompanyShareholdersTable({
  stakeholders,
}: {
  stakeholders: StakeholderSummary[];
}) {
  return (
    <div className="rounded-xl border border-lucathi-line bg-lucathi-mist/50 p-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-lucathi-gray">
        Sócios (quadro societário)
      </p>
      {stakeholders.length ? (
        <ul className="mt-2 space-y-1">
          {stakeholders.map(stakeholder => (
            <li
              key={stakeholder.id}
              className="flex items-center justify-between text-sm text-lucathi-navy"
            >
              <span>{stakeholder.displayName ?? "Sem vínculo"}</span>
              <span className="text-xs text-lucathi-gray">
                {Number(stakeholder.percentage).toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                %
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-1 text-xs text-lucathi-gray">
          Nenhum sócio vinculado — cadastre no painel “Holding e sociedades”.
        </p>
      )}
    </div>
  );
}
