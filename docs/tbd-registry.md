# Registro de TBDs

| ID | Tema | Estado atual | Como o sistema deve reagir agora |
|---|---|---|---|
| TBD-01 | PostgreSQL/Neon | Portabilidade pendente | Usar o banco do scaffold sem acoplar a UI a detalhes do provider |
| TBD-02 | Scheduler e alertas automáticos | Não adotado | Calcular alertas sob demanda; não criar jobs em background |
| TBD-03 | MFA | Fora do MVP1 | Aplicar controles compensatórios de sessão e autorização |
| TBD-04 | Backup e restauração | Fase de produção | Não declarar o sistema pronto para produção externa |
| TBD-05 | Matriz completa de documentos de imóveis e sociedades | Resolvido na modelagem | Imóveis: Matrícula, IPTU ou ITR (se sem matrícula: Escritura ou Contrato C&V). Sociedades: Contrato Social/Alteração consolidada, CNPJ; se S/A: Estatuto e Atas. Dispensa formalizada pelo advogado e aprovada pelo Sócio. |
| TBD-06 | Efeitos patrimoniais dos regimes | Validado para MVP | STB sem distinção convencional/obrigatória na interface; apuração macro do patrimônio conjunto frente à sucessão aos herdeiros |
| TBD-07 | Relações sucessórias e procuradores | MVP2 | Não criar relações ou poderes automaticamente |
| TBD-08 | LWR, proposta financeira e contratação | Resolvido na modelagem | LWR gerenciado como apresentação Taylor-made (Canva/slides); Proposta financeira separada com escopo, valor, aceite e fluxo de contraproposta com análise pelo Sócio |
| TBD-09 | Cálculos tributários avançados | MVP2 | Exibir somente cálculos e parâmetros formalmente aprovados |
