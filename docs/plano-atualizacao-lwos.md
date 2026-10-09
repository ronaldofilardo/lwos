# Plano de Atualização do LWOS — Fase de Validação

Plano por fases para execução por agente de IA · 09/10/2026 · Base: bkpLWOS.zip + decisões do cliente

## 0. Instruções ao agente executor

**Contexto.** O LWOS usa React/Vite, Express/tRPC e Drizzle/PostgreSQL. A fase atual é de validação e correção dos dados digitados pelos usuários: toda decisão de desenho deve priorizar impedir que dado errado ou inconsistente entre no sistema.

**Regras de trabalho**

- Leia o AGENTS.md e use o graft (graft ask, graft callers, graft grep) antes de abrir arquivos inteiros.
- Execute uma fase por vez. Ao final de cada fase rode o typecheck e a suíte vitest do projeto, crie/atualize os testes da fase e não avance com falha.
- Os dados atuais (famílias, documentos, arquivos) são de teste e descartáveis. É permitido recriar lwos_db e lwos_db_test, limpar a pasta de storage (C:\apps\LWOS\storage) e a tabela fileBlobs juntas. Não escreva conversões de dados legados. Ainda assim gere migrations drizzle numeradas (a próxima após a 0012).
- Validação no servidor é a fonte da verdade (zod + repositório). O client apenas espelha as regras para dar feedback rápido.
- Mensagens de erro em pt-BR, objetivas e acionáveis.
- CPF e CNPJ são gravados só com dígitos e exibidos com máscara. Valores em decimal(15,2); percentuais com 2 casas; um único utilitário de parse/format pt-BR (1.500,50 nunca pode virar 1,5).
- A troca «Família → Projeto» é só de rótulos: mantenha nomes de tabela, rotas (/familias) e familyId.
- Reconciliações automáticas nunca apagam arquivo enviado; só removem pendências sem arquivo.
- Exclusões e mudanças de regra sensível (dependente, gravame, titularidade, status do projeto) gravam em auditLogs.
- Entrega: a cada fase, um zip só com os arquivos alterados mais um LEIA-ME.md (arquivos, migration, comandos, como reverter). Quem usa o sistema aplica os arquivos manualmente.

## 1. Decisões já fechadas pelo cliente (não reabrir)

- **UF para imposto no MVP1:** apenas a UF do doador. (Regra geral futura: imóvel doado usa a UF do imóvel; demais bens usam a UF do doador.) A UF do imóvel continua sendo coletada.
- **Gravames — semáforo:** «Não há» verde; «Outros» vermelho; «Pendente» amarelo; N/A amarelo; todos os demais vermelho. Só o vermelho trava o imóvel; o amarelo apenas alerta.
- **Valor de IR sobre GCAP:** campo em R$, preenchido manualmente (imposto de renda sobre ganho de capital na venda do imóvel). O rótulo é exatamente «Valor de IR sobre GCAP».
- **Titular do imóvel** pode ser pessoa ou sociedade.
- **Objetivo do projeto:** escolha múltipla.
- **Fonte única de documentos:** a seção «Documentos e Certidões» (antiga Matriz Documental e Compliance) é a única fonte de todos os documentos, inclusive os de sociedades e as certidões. O modal «Detalhes» apenas lê e abre o upload do mesmo registro.
- **Offshore:** além dos documentos de existência e controle, entram a conferência de IRPF/declaração ao Banco Central e o marcador de apostila/tradução (confirmados). Trust e Foundation ficam fora do MVP1.
- Dados existentes são de teste e podem ser descartados.

## 2. Padrões adotados onde falta decisão (o agente segue o padrão e deixa configurável)

| Tema | Padrão adotado | Confirmar com |
| --- | --- | --- |
| Documentos de SCP | Mesma lista da LTDA | Jurídico |
| Documentos por categoria de ativo | «Comprovante de titularidade» para todos; remover «Avaliação/laudo» (não há mais valor de mercado) | Cliente |
| Dependente do titular | Marcar dependente herda o status do documento IRPF do titular e bloqueia o upload desse documento; demais documentos continuam exigidos. Só pode marcar se o IRPF do titular estiver recebido. | Cliente |
| Soma de titularidade do imóvel | Calculada por tipo de direito (propriedade, nua-propriedade, usufruto), cada um ≤ 100% | Cliente |
| Data de nascimento | Obrigatória para todos os membros | Cliente |
| UF do membro | Obrigatória para todos (qualquer membro pode ser doador) | Cliente |
| Responsável do ativo | Obrigatório | Cliente |
| Certidão — alerta vermelho | POSITIVA e SOMENTE_FISICA. PENDENTE e certidão vencida: amarelo. POSITIVA_COM_EFEITOS_DE_NEGATIVA: tratada como negativa | Cliente |
| Alerta nas telas de imóveis e ativos | Mostra exclamação se o titular (pessoa ou sociedade) tem certidão em vermelho | Cliente |
| Gate de conclusão | Projeto não pode ir para «Concluído» com imóvel em gravame «Pendente» | Cliente |
| Documentos condicionais da offshore | Status «Não possui» disponível para cláusulas sucessórias e testamento local | Jurídico |

## 3. Ordem e dependências

1. Núcleo de validação compartilhado
2. Schema e migrations
3. Projeto
4. Pessoas
5. Imóveis (titularidade e gravames)
6. Sociedades
7. Demais ativos
8. Documentos e Certidões (fonte única)
9. Alertas e travas
10. Regressão e fechamento

As fases 3 a 7 dependem das 1 e 2. A fase 8 depende de 4 a 7. A fase 9 depende de 8.

---

## Fase 1 — Núcleo de validação compartilhado

**Objetivo:** criar em shared/ as funções puras que todas as telas e rotas usarão.

**Tarefas**

- cpf: normaliza para dígitos, valida tamanho e dígito verificador, rejeita sequências repetidas (111.111.111-11).
- cnpj: mesma lógica com DV do CNPJ.
- uf: lista das 27 siglas e tipo/zod enum reutilizável.
- idade: (a) idade em anos completos de calendário (usada em regras, como menor de idade); (b) idade decimal para exibição, (hoje − nascimento) / 365,25, formatada xx,x anos. Nunca gravar a idade. Datas tratadas só como data (sem horário), fuso America/Sao_Paulo.
- data de nascimento: não futura; idade máxima razoável (ex.: 120 anos).
- telefone: DDD + 8 ou 9 dígitos (padrão nacional); normaliza para dígitos.
- dinheiro e percentual: parse/format pt-BR, não negativo, percentual com 2 casas e faixa 0–100.
- NIRF e CCIR: validação por dígitos e tamanho configurável (confirmar formato oficial; não inventar DV).

**Critérios de aceite**

- Testes unitários com CPFs/CNPJs válidos e inválidos conhecidos, datas limite (aniversário de 18 anos exato, 29/02) e parse pt-BR (1.500, 1.500,50, 0,5).
- Nenhuma tela ou rota usa regex própria de CPF/CNPJ depois da Fase 10.

---

## Fase 2 — Schema e migrations

**Objetivo:** ajustar o banco de uma vez para suportar as regras das próximas fases. Como os dados são descartáveis, vale recriar o banco.

**Projeto (families / projects)**

- Remover civilStatus e maritalRegime de families (o estado civil do cônjuge passa a vir do cadastro do titular; ver Fase 4).
- Objetivos múltiplos: tabela projectObjectives (projectId/familyId, objective) com unique (familyId, objective) e enum com as 14 opções (Proteção patrimonial, Planejamento sucessório, Governança familiar ou societária, Prevenção de conflitos entre herdeiros, Formalização de relacionamentos, Seguro de vida, Seguro saúde, Eficiência fiscal, Reestruturação societária, Diversificação de jurisdição e moeda, Fundos de investimentos, Saída definitiva do Brasil, Reperfilamento de dívida, Filantropia). Atenção à grafia: «Saída», não «Saíde».
- projectStatus passa a ATIVO, SUSPENSO, CONCLUIDO, CANCELADO (default ATIVO).

**Pessoas (people)**

- Novas colunas: phone, endereço (cep, street, number, complement, district, city, uf), addressSameAsPrimary (boolean), isDependent (boolean).
- Índice único (familyId, taxId) sobre CPF normalizado.
- Índice único parcial: um único cônjuge por titular (vinculo = 'CONJUGE' por familyId).

**Imóveis (properties)**

- kind (URBANO | RURAL), notes (observação), uf, propertyCity.
- Cartório: registryOfficeNumber (inteiro 1–55, CHECK), registryUf, registryCity. Remover o texto livre registryOffice.
- Valores: irpfBalanceValue (renomeia declaredValue), marketValue, venalValue, irGcapValue, emolumentsValue (todos ≥ 0).
- itbiRate (0–100), hasLaudemio (boolean), laudemioRate (obrigatória e > 0 se hasLaudemio).
- utility (enum: ATIVIDADE_INDUSTRIAL_COMERCIAL, ATIVIDADE_RURAL, INVESTIMENTO, LAZER, LOCACAO_ARRENDAMENTO, OUTRA, PENDENTE, RESIDENCIAL; default PENDENTE) e rentValue (obrigatório > 0 se Locação/Arrendamento).
- inscricaoImobiliaria; ccir e nirf (obrigatórios se rural).
- Gravame como coluna do imóvel (uma só informação basta): encumbranceType (enum: PENDENTE [default], ALIENACAO_FIDUCIARIA, ARROLAMENTO, HIPOTECA, INCOMUNICABILIDADE_INALIENABILIDADE_IMPENHORABILIDADE, NA, NAO_HA, OUTROS, PENHORA, SERVIDAO_PASSAGEM, USUFRUTO) e encumbranceNote. Remover a tabela encumbrances.

**Titularidade (propertyOwners)**

- personId e companyId ambos anuláveis, com CHECK de exatamente um preenchido.
- Únicos (propertyId, personId) e (propertyId, companyId).

**Sociedades (companies / companyDetails)**

- Remover o enum de tipo nacional/internacional; criar isOffshore (boolean). taxNumber obrigatório se não offshore. Unique (familyId, taxNumber).
- companyDetails.uf (enum de UF), societaryType (enum LTDA, SA, SCP), taxRegime (enum SIMPLES_NACIONAL, LUCRO_PRESUMIDO, LUCRO_REAL), jurisdiction obrigatória se offshore, companyNumber (identificador estrangeiro) obrigatório se offshore.
- Remover a tabela propertyContributions (integralização) e companyDetailDocs (documentos passam a ficar só em documents).

**Ativos (otherAssets)**

- category com 8 valores: ATIVOS_AGRO, CONTA_CORRENTE, CREDITO, DINHEIRO_ESPECIE, INVESTIMENTOS, OUTROS, SEMOVENTES, VEICULO_EMBARCACAO_AERONAVE. Sem default.
- Remover marketValue; declaredValue passa a obrigatório (> 0); ownerPersonId obrigatório.

**Documentos e certidões**

- documentStatus: adicionar NAO_POSSUI.
- documents: adicionar issuedAt, validUntil, referenceDate (balanço/balancete), apostilled e translated (booleans).
- certidoes: manter escopos PESSOA e SOCIEDADE.

**Critérios de aceite:** migration aplica do zero em banco vazio; schema compila; testes antigos que dependem de colunas removidas são atualizados (não apagados sem substituição).

---

## Fase 3 — Projeto (antiga Família)

**Rótulos**

- «Família» → «Projeto»; «Criar uma família» → «Criar um Projeto»; «Famílias em acompanhamento» → «Projetos em acompanhamento»; campo «Nome da família» → «Projeto»; «Voltar» → «Voltar para Projetos»; título interno → «Área de Trabalho - Projeto».

**Criar projeto**

- Remover «situação conjugal» e «regime».
- Campo Objetivo como multisseleção com as 14 opções; exigir ao menos uma. Manter «Observação».
- Validar nome do projeto (mín. 3 caracteres); alertar (não bloquear) nome duplicado.

**Lista «Projetos em acompanhamento»**

- Colunas: Status (Ativo, Suspenso, Concluído, Cancelado), Nome do Cliente (nome do titular; «—» se ainda não houver), Telefone de contato e E-mail do titular.

**Área de Trabalho**

- Subtítulo abaixo do nome com os objetivos selecionados (se muitos, mostrar os dois primeiros e «+N»).

**Critérios de aceite:** não é possível criar projeto sem objetivo; o servidor recusa a criação sem objetivo mesmo que o client falhe; o cônjuge continua sendo criado sem depender de colunas removidas de families.

---

## Fase 4 — Pessoas

**Obrigatoriedade por vínculo (no schema zod e no repositório)**

- Titular: nome, CPF válido, e-mail válido, data de nascimento, UF. Telefone obrigatório para o titular (alimenta a lista de projetos).
- Demais membros: nome, CPF válido, data de nascimento, UF.
- CPF único dentro do projeto (erro); mesmo CPF em outro projeto gera aviso, exceto a regra existente de titular em duas famílias, que continua sendo erro.
- Editar o CPF do titular dispara a migração da pasta de storage e a checagem de colisão já existentes (family-storage-migration).

**Endereço**

- Campos de endereço por membro, com UF em campo separado (enum de 27). Checkbox «mesmo endereço do titular»: guardar a flag e referenciar o endereço do titular (se o titular mudar, os demais acompanham).

**Estado civil e idade**

- Menor de 18 anos (anos completos): estado civil forçado a «Solteiro» no servidor e campo bloqueado; sem regime de bens.
- Ao completar 18 anos, o campo deixa de ser automático e passa a exigir confirmação.
- Idade decimal exibida ao lado da data de nascimento (xx,x anos), só na tela.
- Coerência entre gerações: filho não pode nascer antes do pai/mãe; diferença menor que 12 anos gera aviso.

**Cônjuge**

- Estado civil «Casado» (e união estável) habilita o campo do nome do cônjuge no mesmo formulário.
- Titular só pode ter um cônjuge (erro no servidor e índice único). O estado civil e o regime do cônjuge do titular passam a vir do cadastro do titular, não de families.

**Interface**

- Remover os campos de upload de documentos dessa seção (ficam em «Documentos e Certidões»).
- Botão Editar abre modal; botão Excluir com confirmação que mostra o que será afetado.
- Excluir bloqueia se a pessoa for titular, tiver filhos/netos dependentes na árvore, titularidade de imóvel, participação em sociedade ou ativo. Sem vínculos, remove a pessoa e arquiva seus documentos (arquivos não são apagados do disco sem ação explícita).
- Placeholder do campo de observação: apenas «Observação».
- Mover o cadastro/edição para o modal de «Detalhes», como o cliente sugeriu, sem duplicar regras.

**Critérios de aceite:** não é possível salvar pessoa sem CPF válido; menor sai sempre «Solteiro»; segundo cônjuge é recusado; excluir pessoa vinculada é recusado com mensagem clara.

---

## Fase 5 — Imóveis (titularidade e gravames)

Título e subtítulo: apenas «Imóveis».

**Cadastro**

- UF e cidade do imóvel (UF primeiro, cidade em seguida, dependente da UF).
- Cartório de Registro: número 1–55 (inteiro) + UF + cidade do cartório (o número sozinho não identifica o ofício).
- Tipo Urbano/Rural. Se rural: CCIR e NIRF obrigatórios; se urbano: inscrição imobiliária. Trocar o tipo limpa os campos do outro tipo e reconcilia os documentos (Fase 8).
- Valores, nesta ordem no modal: Valor IRPF/Balanço, Valor estimado de mercado, Valor venal, mais Valor de IR sobre GCAP e Emolumentos (R$). Todos ≥ 0. Aviso (não bloqueio) se o venal divergir muito do mercado.
- ITBI em % (0,00) com faixa 0–100 e aviso para valor atípico. Laudêmio/Aforamento: botão sim/não; se sim, alíquota 0,00% obrigatória; se não, limpar o valor.
- Utilidade (droplist; padrão «Pendente»); se Locação/Arrendamento, abre o campo de valor (obrigatório > 0); outras opções limpam o valor.
- Observação, botão Editar do imóvel (abre modal) e excluir com confirmação.

**Titularidade**

- Titular pessoa ou sociedade (exatamente um).
- Soma por tipo de direito ≤ 100%; ao chegar a 100% o formulário de nova titularidade some (e o servidor recusa).
- Mesma pessoa/sociedade não pode entrar duas vezes no mesmo imóvel.
- Título azul «Titularidade do Imóvel» e, logo abaixo, título azul «Gravames» no mesmo padrão.

**Gravames**

- Um único campo com a lista: Pendente (padrão), Alienação Fiduciária, Arrolamento, Hipoteca, Incomunicabilidade/Inalienabilidade/Impenhorabilidade, N/A, Não há, Outros, Penhora, Servidão de passagem, Usufruto.
- Semáforo: Não há = verde; Pendente e N/A = amarelo; todos os demais, inclusive Outros = vermelho.
- Depois de informado o gravame, o campo de novo gravame desaparece (só edição).
- Vermelho trava a movimentação do imóvel (em particular, qualquer vínculo com sociedade e ações de conclusão); amarelo só alerta.
- Remover o default «Hipoteca» do formulário.

**Critérios de aceite:** imóvel novo nasce com gravame «Pendente» (amarelo); rural sem CCIR/NIRF não salva; titularidade a 100% não permite nova linha; titular sociedade funciona.

---

## Fase 6 — Sociedades

Cadastro enxuto: título e subtítulo apenas «Sociedades». Campos iniciais: Denominação Social e CNPJ, mais o checkbox Offshore (substitui o droplist nacional/internacional).

- CNPJ com DV, único por projeto, obrigatório se não offshore.
- Offshore: sem CNPJ, sem regime tributário brasileiro; exige jurisdição e identificador estrangeiro.

**Modal «Detalhes»**

- Aparece também para Pessoas e Ativos.
- UF em droplist de siglas; Tipo societário (LTDA, S/A, SCP); Regime tributário (Simples Nacional, Lucro Presumido, Lucro Real).
- Regra: S/A não pode ser Simples Nacional (LC 123/2006, art. 3º, §4º); recusar a combinação.
- Empresa em Simples Nacional recebe destaque visual na lista.
- Subtítulo do valor passa a «Valor estimado da empresa». Remover o subtítulo sob «VALORES POR QUOTA/AÇÃO».
- Remover o droplist «móveis para integralizar» e o botão de % de integralização (e a tabela correspondente).
- Balanço fechado e balancete atualizado permitem upload e pedem data-base (referenceDate); o arquivo grava em documents.

**Quadro societário**

- Soma ≤ 100%; ao atingir 100% o formulário de novo sócio some e o servidor recusa. Tolerância de arredondamento já usada (PCT_EPSILON).
- Ao lado de cada sócio, valor total investido = % × capital social; se o capital estiver vazio, mostrar «—».
- Sócio externo comparado por nome normalizado (sem acento, minúsculas, espaços únicos) para evitar duplicidade.

**Critérios de aceite:** S/A + Simples é recusado; offshore salva sem CNPJ mas não sem jurisdição; sócio extra após 100% é recusado.

---

## Fase 7 — Demais ativos

- Título «Demais Ativos»; subtítulo «Investimentos, Veículos e Outros».
- Categoria obrigatória, sem valor padrão (corrige o preenchimento automático com «Aplicação financeira»); as 8 opções da Fase 2.
- Remover «Valor estimado de mercado». Valor declarado obrigatório (> 0). Responsável obrigatório. Verificar e remover qualquer placeholder que esteja sendo submetido como valor (caso «Thiago»).
- Botões Editar (modal com campos editáveis) e Excluir com confirmação.
- Descrição mínima de 2 caracteres e sem valor placeholder gravado.

**Critérios de aceite:** não é possível salvar ativo sem categoria, valor ou responsável; editar e excluir funcionam e respeitam a auditoria.

---

## Fase 8 — Documentos e Certidões (fonte única)

**Arquitetura**

- Reescrever a geração de requisitos como função pura computeRequirements(entidade) (por pessoa, imóvel, sociedade, ativo) e uma rotina reconcile que cria o que falta e remove só pendências sem arquivo. Rodar reconcile sempre que mudarem: estado civil, dependente, tipo do imóvel, existência de matrícula, tipo societário ou offshore.
- O modal «Detalhes» passa a ler e gravar em documents; companyDetailDocs deixa de existir.
- Certidões continuam em certidoes, mas apresentadas dentro do membro ou da sociedade (não mais como bloco separado). O item é parte do mesmo registro e conta nos mesmos indicadores.

**Interface**

- Seção renomeada para «Documentos e Certidões», com três blocos contraídos por padrão: Família (Pessoas), Imóveis, Sociedades. Ao expandir Família, aparecem os membros; ao clicar em um membro, a lista de documentos pendentes e recebidos/validados, incluindo as certidões.
- Subseção Imóveis: apenas o nome do imóvel (sem subtítulo). Subseção Sociedades: apenas a denominação (sem subtítulo).

**Matriz de documentos**

- Pessoa: IRPF, CPF/RG ou CNH, Comprovante de endereço, Passaporte. Documento de união conforme o estado civil: Casado → Certidão de casamento; União estável → escritura ou declaração de união estável; Divorciado/Viúvo → Certidão de casamento com averbação; Solteiro → nada. Regra do casal: o cônjuge do titular não recebe duplicata dos documentos compartilhados.
- Dependente do titular (checkbox, exceto titular): o documento IRPF herda o status do IRPF do titular e o upload dele é bloqueado; só pode ser marcado se o IRPF do titular estiver recebido; registrar quem marcou.
- Imóvel urbano: IPTU + Matrícula. Rural: ITR, Matrícula, CAR, CCIR. Se o imóvel foi cadastrado sem matrícula, no lugar da Matrícula pede-se a escritura pública ou o contrato de compra e venda.
- Sociedade LTDA: Comprovante de Inscrição no CNPJ, Contrato Social Consolidado, Balanço Fechado, Balancete Atualizado, Acordo de Sócios, Livro Razão do Imobilizado.
- Sociedade S/A: a lista da LTDA mais Livro de Registro de Ações Nominativas e Livro de Transferência de Ações.
- SCP: padrão igual à LTDA (confirmar).
- Offshore, obrigatórios: Certificate of Incorporation, Memorandum & Articles of Association, Register of Members, Register of Directors, Share Certificate(s), Certificate of Good Standing, Balance Sheet, além de uma conferência de IRPF/declaração ao Banco Central com a participação.
- Offshore, condicionais (status «Não possui» disponível): cláusulas sucessórias e testamento local da jurisdição.
- Ativo: Comprovante de titularidade (padrão a confirmar por categoria).
- Certificate of Good Standing e demais itens com prazo guardam issuedAt/validUntil; vencido vira pendência (amarelo). Documentos emitidos no exterior têm os marcadores Apostilado e Traduzido.
- Balanço fechado e balancete guardam referenceDate.

**Critérios de aceite:** mudar solteiro → casado cria a pendência correta sem apagar arquivos enviados; mudar urbano → rural recalcula a lista; mudar LTDA → S/A acrescenta os dois livros; existe um único lugar de upload por documento; o modal «Detalhes» e a seção mostram o mesmo status.

---

## Fase 9 — Alertas e travas

- Exclamação vermelha nas telas de Pessoas, Imóveis, Sociedades e Ativos quando houver certidão positiva ou somente física (não emitida pela internet) da pessoa ou sociedade. Nas telas de Imóveis e Ativos, vale para o titular (pessoa ou sociedade).
- Certidão pendente ou vencida: indicador amarelo. Positiva com efeitos de negativa: sem alerta.
- O cálculo vive no servidor (um endpoint de resumo por projeto) e é reutilizado por todas as telas e pela lista de projetos.
- Trava do imóvel: gravame vermelho bloqueia as ações de movimentação definidas na Fase 5.
- Gate de conclusão: o projeto não pode ir para «Concluído» com imóvel em gravame «Pendente» nem com certidão em vermelho sem justificativa registrada.

**Critérios de aceite:** mudar a certidão de um sócio para positiva acende o alerta na tela correspondente sem recarregar manualmente; o gate impede a conclusão e informa o motivo.

---

## Fase 10 — Regressão e fechamento

- Rodar todos os testes; recriar os de repositórios e roteadores afetados (pessoas, imóveis, companhias, ativos, certidões, documentos).
- Varrer o código por usos antigos: HOLDING_NACIONAL/INTERNACIONAL, propertyContributions, encumbrances, companyDetailDocs, civilStatus de families, marketValue de ativos, a categoria «IPTU ou ITR».
- Verificar que nenhuma tela usa validação de CPF/CNPJ própria (usar o núcleo da Fase 1).
- Teste de ponta a ponta de um projeto completo: criar projeto com 2 objetivos, titular, cônjuge, filho menor, imóvel urbano e rural, sociedade LTDA e uma offshore, ativo, certidão positiva, e checar alertas, travas e gate.
- Atualizar docs/tbd-registry.md (decisões fechadas e padrões adotados) e o LEIA-ME.md.
- Entregar o zip final com a lista de migrations e o roteiro de aplicação.

### Checklist final de aceite

- [ ] Nenhum CPF/CNPJ inválido é aceito.
- [ ] Nenhum campo obrigatório é salvo vazio ou com placeholder.
- [ ] Nenhuma soma de participação/titularidade passa de 100%.
- [ ] Cônjuge único e menor sempre solteiro.
- [ ] Gravame nasce Pendente; só o vermelho trava.
- [ ] S/A não aceita Simples Nacional.
- [ ] Cada documento tem um único lugar de upload.
- [ ] Alertas vermelhos refletem certidões positivas ou somente físicas.
- [ ] Projeto não conclui com imóvel pendente.
- [ ] Todas as migrations aplicam do zero e todos os testes passam.
