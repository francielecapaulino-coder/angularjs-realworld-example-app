# PLAN - 021-editor-draft

## Status
State: PLANNED

## Issue
#25

## Objetivo
Persistir o rascunho do editor de artigo em localStorage, restaurando-o antes do submit
ao backend. (Auditoria item #3.)

## Abordagem
- Chave: `localStorage['conduit-editor-draft']` (JSON: title, description, body, tagList).
- Escopo: apenas modo **novo artigo** (sem `slug`). No modo edit, NAO usar draft
  (evita conflito com o conteudo carregado via GET).
- Autosave:
  - `form.valueChanges` com `debounceTime(400)` + `takeUntilDestroyed()` -> grava draft.
  - `effect()` observando o signal `tagList` -> grava draft (tags fora do form).
- Restore: no `ngOnInit`, se `!slug` e existir draft valido, `patchValue` + `tagList.set`.
- Clear: apos submit bem-sucedido (`next`), remover a chave.
- Robustez: try/catch em torno de localStorage (ambiente sem storage).

## Escopo
- Incluido: autosave + restore + clear-on-submit + testes (unit + e2e).
- Fora de escopo: botao explicito de descartar; multiplos rascunhos; sincronizacao com backend.

## Operational path & risk
- risk_category: B  # feature de UI aditiva, sem backend, reversivel.
- human_review: optional

## Gates
- build: `npm run build` (app-ng) verde.
- unit_tests: salva ao digitar/adicionar tag; restaura no init (modo novo);
  limpa apos submit; NAO restaura no modo edit.
- e2e_tests: digitar -> reload -> conteudo restaurado; submit limpa o draft.
- config_review: chave `conduit-editor-draft`; sem segredos.

## Condicoes de parada
- Se o autosave causar churn/loop com valueChanges, ajustar debounce/guarda.
