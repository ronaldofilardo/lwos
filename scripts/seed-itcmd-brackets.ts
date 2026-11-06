import "dotenv/config";
import { getAllBaselineBrackets } from "../shared/domain/itcmd-seed-data";
import { saveUfPolicy } from "../server/features/setup/itcmd-repository";

async function main() {
  console.log("Iniciando injeção das políticas de ITCMD das 27 UFs...");
  const all = getAllBaselineBrackets();
  const byUf = new Map<string, typeof all>();

  for (const b of all) {
    const list = byUf.get(b.uf) ?? [];
    list.push(b);
    byUf.set(b.uf, list);
  }

  for (const [uf, brackets] of byUf.entries()) {
    await saveUfPolicy(uf, brackets);
    console.log(`  ✓ ${uf}: ${brackets.length} faixa(s) injetada(s)`);
  }

  console.log("Injeção das 27 UFs concluída com sucesso!");
  process.exit(0);
}

main().catch(err => {
  console.error("Erro na injeção:", err);
  process.exit(1);
});

