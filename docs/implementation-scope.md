# Escopo Incremental de Implementação

## Decisão de execução

O projeto avançará com os requisitos confirmados. Regras jurídicas, tributárias, operacionais ou de infraestrutura que ainda não possuam decisão explícita serão registradas como **TBD** e não serão inferidas pela aplicação.

## Primeiro incremento

O primeiro incremento contempla autenticação, perfis SOCIO/ANALISTA/ADMIN/CLIENTE, Família, Pessoas, documentos versionados com fluxo de dispensa justificada e aprovada pelo SOCIO, imóveis com suporte a imóvel sem matrícula (Escritura/Contrato C&V), alerta de gravame, destaque visual de usufruto/nua-propriedade, sociedade nacional, integralização com estados de operação, portal do cliente, Due Diligence organizada em 4 pilares (Família, Imóveis, Sociedades, Demais Ativos), LWR executivo (Canva/apresentação sob medida) e Proposta Financeira autônoma com aceite e contraproposta analisada pelo SOCIO.

## Banco de dados

O scaffold disponível utiliza MySQL/TiDB com Drizzle. Ele será usado para a fundação do incremento atual, sem alterar o contrato de domínio. A migração ou a portabilidade para PostgreSQL/Neon permanece registrada como TBD de infraestrutura e não bloqueará os módulos confirmados.

## Fora do primeiro incremento

Permanecem fora do incremento: scheduler/cron/background worker, MFA, backup e restauração de produção, relações sucessórias detalhadas, efeitos patrimoniais automáticos dos regimes de bens, procuradores, cálculo avançado de payback, comparação PF/PJ, recomendação Melhor Vender, CRI completo, offshore e recorrência Lucathi Black.
