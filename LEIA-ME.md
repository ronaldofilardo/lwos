# Fluxo de "Interessados" (leads públicos → família)

## O que foi implementado
1. **Tela de login** (`AuthGate.tsx`): link "Tenho interesse em conhecer a
   Lucathi" abaixo do formulário, leva pra `/interesse`.
2. **`/interesse` (pública, novo `Interesse.tsx`)**: formulário com nome,
   CPF, e-mail, data de nascimento e upload de 1 arquivo (imagem ou PDF).
   Envia pra `leads.create` (rota pública, sem autenticação).
3. **Backend** (`server/features/leads/`): nova feature completa.
   - `lead-types.ts`: schemas de validação (create/accept/reject).
   - `lead-repository.ts`: grava o lead + arquivo no storage local
     (`STORAGE_ROOT/leads/{leadId}/{arquivo}`), lista, aceita e recusa.
   - `lead-router.ts`: `leads.create` (pública), `leads.list` (SOCIO/ADMIN),
     `leads.accept` e `leads.reject` (SOCIO).
4. **`/interessados` (novo `Leads.tsx`, exclusivo SOCIO/ADMIN)**: lista os
   pendentes com link pra abrir o documento anexado, e dois botões:
   - **Aceitar** → abre um miniformulário (nome da família, estado civil,
     regime de bens — únicos dados que faltam pra criar a família) e, ao
     confirmar, chama `leads.accept`: cria a família E já cadastra o
     interessado como **pessoa titular** com os dados que ele mesmo
     enviou (nome/CPF/e-mail/nascimento). A partir daí o botão existente
     "Gerar link de primeiro acesso" (na tela de famílias) já funciona
     normalmente, porque o titular já tem CPF + nascimento.
   - **Recusar** → marca o lead como recusado, sem criar nada.
5. **Link no menu** (`AppShell.tsx`): item "Interessados" visível só pra
   SOCIO/ADMIN, ao lado do Dashboard.
6. **Download do documento anexado** (`storageProxy.ts`): o proxy
   `/local-storage/*` agora também reconhece arquivos de leads e só libera
   pra SOCIO/ADMIN (antes só conhecia arquivos de documentos de família).
7. **Banco** (`drizzle/schema.ts`): nova tabela `leads` (nome, CPF, e-mail,
   nascimento, arquivo, status PENDENTE/ACEITO/RECUSADO, quem revisou).

## O que NÃO foi automatizado (por design)
"Sócio contacta por fora do sistema" — não há e-mail/notificação automática
pro sócio nem pro interessado. A tela `/interessados` é só um painel de
consulta manual mesmo, como pedido.

## Aplicar
1. Copie os arquivos listados abaixo nos mesmos caminhos.
2. Rode `pnpm db:push` (gera e aplica a migração da tabela `leads` — sem
   isso o app quebra, porque a tabela ainda não existe no banco).
3. Reinicie `pnpm dev` (matando processos node antigos antes).

## Arquivos no zip
- `drizzle/schema.ts` (alterado — tabela `leads`)
- `server/features/leads/lead-types.ts` (novo)
- `server/features/leads/lead-repository.ts` (novo)
- `server/features/leads/lead-router.ts` (novo)
- `server/routers.ts` (alterado — registra `leads`)
- `server/_core/storageProxy.ts` (alterado — libera download do doc do lead pro time)
- `client/src/pages/Interesse.tsx` (novo — formulário público)
- `client/src/pages/Leads.tsx` (novo — painel do sócio)
- `client/src/App.tsx` (alterado — rotas `/interesse` e `/interessados`)
- `client/src/components/lucathi/AppShell.tsx` (alterado — item de menu)
- `client/src/components/lucathi/AuthGate.tsx` (alterado — link no login)
