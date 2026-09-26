# Instalação local — Lucathi Wealth OS

## Destino

Extraia o pacote para `C:\apps\LWOS`. O diretório deverá conter `package.json`, `client`, `server`, `drizzle`, `scripts` e este guia.

## Pré-requisitos

Instale o Node.js 22 LTS, PNPM 10, PostgreSQL com `psql` disponível no `PATH` e Git (opcional). A aplicação usa o banco de desenvolvimento `lwos_db` e o banco separado de testes `lwos_db_test`.

## Bancos locais

Os comandos de referência informados para acesso são:

```powershell
psql -U postgres -d lwos_db -h localhost
psql -U postgres -d lwos_db_test -h localhost
```

O usuário padrão é `postgres`. A senha deve ser mantida apenas no computador local e preenchida no prompt do script ou no arquivo `.env.local`; ela não deve ser incluída em Git, ZIP compartilhado ou logs.

No PowerShell, execute:

```powershell
cd C:\apps\LWOS
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\windows\bootstrap-local-postgres.ps1
Copy-Item .env.local.example .env.local
notepad .env.local
```

Atualize `SUA_SENHA_LOCAL` em `.env.local` com a senha local do PostgreSQL.

## Dependências e execução

```powershell
cd C:\apps\LWOS
pnpm install
pnpm check
pnpm test
pnpm dev
```

O ambiente de testes deve utilizar `TEST_DATABASE_URL` para preservar o banco de desenvolvimento. Nunca utilize dados reais de famílias, patrimônio ou documentos no banco de testes.

## Estado de compatibilidade PostgreSQL

O pacote contém a configuração local de ambiente e o driver `pg` para a variante PostgreSQL. A aplicação hospedada permanece acoplada ao banco gerenciado originalmente fornecido pelo scaffold. Antes de substituir a base hospedada por PostgreSQL, execute uma migração controlada do schema Drizzle, revise constraints, índices e a compatibilidade dos procedimentos tRPC. Não conecte o ambiente local diretamente a dados de produção.

## UX incorporada

A landing page institucional inspira a experiência local por meio de linguagem discreta, foco em legado, proteção patrimonial e governança familiar, uso de blocos de mensagem em azul profundo e CTAs de diagnóstico. A plataforma mantém essas referências em um ambiente de gestão fechado, sem replicar a função comercial da landing page.[1]

## Referência

[1]: https://lucathiconsult.com.br/ "Lucathi Consult — Consultoria Patrimonial"
