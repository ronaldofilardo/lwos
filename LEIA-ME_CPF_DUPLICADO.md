# Checagem de CPF duplicado como titular entre famílias diferentes

## Arquivos deste pacote → destino em C:\apps\lwos

| Arquivo neste pacote | Destino |
|---|---|
| `server/lib/family-storage-path.ts` | `server\lib\family-storage-path.ts` |
| `server/features/people/person-repository.ts` | `server\features\people\person-repository.ts` |

Sem mudança de schema — não precisa gerar migração.

## O que mudou

Adicionei `findFamilyIdByPrimaryContactCpf(cpf, excludeFamilyId?)` em
`family-storage-path.ts`: varre as pessoas marcadas como `isPrimaryContact`
em todas as famílias, compara o CPF normalizado (só dígitos, ignora máscara)
e retorna o id da família conflitante, se houver.

`person-repository.ts` chama essa checagem em dois pontos, **antes** de
gravar qualquer coisa:

1. **`addPersonRecord`** — se a pessoa está sendo cadastrada já como titular
   (`isPrimaryContact: true`) e tem CPF preenchido, valida contra as outras
   famílias.
2. **`setPrimaryContact`** — antes de trocar o titular, busca o CPF da pessoa
   escolhida e valida do mesmo jeito.

Se houver conflito, a mutation falha com uma mensagem que já nomeia a família
conflitante (usa `getFamilyRecord`, que já existia em `family-repository.ts`):

> "Este CPF já é o titular de outra família (Família Fulano). Corrija o CPF
> ou defina outra pessoa como titular."

Isso aparece no toast de erro do formulário/botão, do mesmo jeito que os
outros erros de validação do projeto (`onError: error => toast.error(error.message)`
já existente em `usePeople.ts` — não precisei mexer no client).

## O que NÃO cobre (por escolha, não por esquecimento)

- **CPF duplicado entre pessoas que não são titulares** — duas pessoas
  (de famílias diferentes ou da mesma família) ainda podem ter o mesmo CPF
  cadastrado se nenhuma das duas for a titular. Isso não afeta o storage
  (só o titular nomeia a pasta), então não bloqueei — mas se quiser validação
  de CPF único em qualquer contexto (não só titular), é outra regra, me avisa.
- **Editar o CPF de quem já é titular** — hoje não existe mutation de editar
  pessoa no projeto (só criar), então não tem como esse caso acontecer ainda.
  Quando vocês adicionarem edição de pessoa, essa mesma checagem
  (`assertCpfNotUsedByAnotherFamily`) precisa ser chamada lá também — deixei
  a função exportada e reutilizável exatamente pra isso.

## Teste rápido

1. Cole os 2 arquivos.
2. `pnpm check`.
3. Cadastre a Família A com uma pessoa titular, CPF `111.111.111-11`.
4. Tente cadastrar a Família B com uma pessoa titular usando o mesmo CPF
   (com ou sem máscara) — deve falhar com a mensagem citando "Família A".
5. Tente usar `people.setPrimaryContact` pra promover, na Família B, uma
   pessoa com esse mesmo CPF — mesmo erro.
6. Cadastre a Família B com titular de CPF diferente — deve funcionar normal.
