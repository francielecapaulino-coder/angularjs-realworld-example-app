# Slice 021 - Editor draft autosave

- **Issue:** #25
- **Data:** 2026-06-25
- **Categoria de risco:** B (feature de UI aditiva, sem backend)

## Prompt(s) do usuario

> "Mergear o PR #24. Próxima slice: #3 (draft no editor)"

## Decisoes tomadas

- Autosave em `localStorage['conduit-editor-draft']` apenas no modo novo artigo.
- valueChanges debounced + effect na tagList; restore no init; clear no submit.
- Edit mode nao usa draft (evita sobrescrever conteudo do backend).
- Fora de escopo: botao de descartar; multiplos rascunhos; sync com backend.

## Resultado

- PR: (a abrir). Gates: build OK, unit 103 passed, e2e 39 passed, encoding limpo.
