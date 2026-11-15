# O Custo de Cada Clique — animação 3D

Curta-metragem animado em 3D com **Remotion** + **three.js** (`@remotion/three`),
sincronizado com a narração gerada no ElevenLabs (`public/narracao.mp3`).

## Comandos

```bash
npm install
npm run studio            # abre o Remotion Studio para ver/editar
npx remotion render OCustoDeCadaClique out/O_Custo_de_Cada_Clique.mp4
```

Sem placa de vídeo, o three.js precisa do WebGL por software:
`remotion.config.ts` já define `swangle`.

## Estrutura

- `src/lib.ts` — marcos de tempo da narração (`T`), câmera por planos, utilitários.
- `src/components/` — personagem, cenários, telas, moldura cinematográfica.
- `src/scenes/` — uma cena por arquivo (quarto, casa dos pais, montagem,
  madrugada, os anos, tentativas, festa de gala, campo de terra).

Para ajustar a sincronia, edite os tempos (em segundos) no objeto `T` em `src/lib.ts`.
