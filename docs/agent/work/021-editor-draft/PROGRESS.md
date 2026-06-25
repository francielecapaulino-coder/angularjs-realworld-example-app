# PROGRESS - 021-editor-draft

State: EVALUATING

## Issue
#25

## Itens entregues
- Autosave do editor em `localStorage['conduit-editor-draft']` (modo novo artigo):
  `form.valueChanges` (debounce 400ms, `takeUntilDestroyed`) + `effect()` na `tagList`.
- Restore no `ngOnInit` quando `!slug`; guarda `ready` evita persistir durante o restore.
- Clear apos submit bem-sucedido.
- Edit mode (`:slug`) nunca usa draft (carrega do backend).
- Robustez: try/catch em torno de localStorage; parsing defensivo do JSON.

## Gates (evidencia)
| Gate | Resultado |
|---|---|
| build (app-ng) | OK |
| unit (Vitest) | **103 passed** (+4 draft) |
| e2e (Playwright) | **39 passed** (+1 draft: digita -> reload -> restaura -> submit limpa) |
| encoding_check | 0 caracteres U+FFFD |

## Notas
- Ajuste durante a avaliacao: o `effect` de autosave roda assincronamente; o teste de tags
  precisou de `fixture.detectChanges()` para dar flush antes de checar o localStorage.
- Chave: `conduit-editor-draft`. Fora de escopo: botao de descartar; multiplos rascunhos.
