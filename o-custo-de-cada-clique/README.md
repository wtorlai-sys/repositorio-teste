# O Custo de Cada Clique — animação 3D

Curta-metragem animado em **2D vetorial** (estilo motion graphics, cores chapadas,
personagens em silhueta e luz de recorte) feito com **Remotion**, sincronizado com a
narração gerada no ElevenLabs (`public/narracao.mp3`).

## Comandos

```bash
npm install
python3 scripts/gerar_moldura.py   # gera a moldura de cinema (vinheta + grão)
npm run studio            # abre o Remotion Studio para ver/editar
npx remotion render OCustoDeCadaClique out/O_Custo_de_Cada_Clique.mp4
```

## Estrutura

- `src/v2/time.ts` — marcos de tempo da narração (`T`), câmera 2D por planos, utilitários.
- `src/v2/Char.tsx` — personagem vetorial (lado, frente, costas; em pé, sentado, no chão).
- `src/v2/parts.tsx` — cenários, telas do jogo, celular, luzes.
- `src/v2/penthouse.tsx` — a cobertura (vista de trás e de lado).
- `src/v2/scenes/` — uma cena por arquivo (quarto, casa dos pais, montagem,
  madrugada, os anos, tentativas, festa de gala, campo de terra).

Para ajustar a sincronia, edite os tempos (em segundos) no objeto `T` em `src/v2/time.ts`.
