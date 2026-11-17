---
name: "historias-roblox-cidade"
description: "Skill do canal para Shorts de histórias Roblox 3D no estilo do @greenbrorants (\"Nesta cidade, [regra impossível]…\"), narrados em 1ª pessoa pelo Max (chamado de Teco na narração), com virada final. Usa o kit-cidade (Remotion + three.js) do repositório wtorlai-sys/repositorio-teste. Ideias, roteiro, personagens, render, legendas ou QC."
---

# Histórias Roblox "Nesta cidade…" (estilo @greenbrorants)

Shorts verticais 9:16 em 3D estilo Roblox: um menino narra em primeira pessoa a vida numa cidade que
tem **uma regra impossível**, a família dele entra no pior caso da regra, a cidade inteira se mobiliza
e, no fim, uma **virada** reinterpreta tudo o que veio antes. Canal de referência:
youtube.com/@greenbrorants. Referências estudadas: *Bottomless Sandbox*, *The Sheepdog* e
*If You Hug Someone You Swap Ages*.

Esta skill é a **camada do canal** por cima da skill `roblox-story-kit` (motor Blender + Flashloop).
O kit faz a produção; esta skill troca a fórmula de roteiro, o elenco, o idioma, o ritmo, o visual e a
legenda pelos do canal. Quando as duas discordarem, **vale esta**.

## ESTADO ATUAL DO CANAL — ler antes de tudo

**Vídeos feitos:** 1 — *O eco da montanha* (1:42, ideia 8). Pasta `eco-da-montanha/` no repositório
`wtorlai-sys/repositorio-teste` (branch de trabalho `claude/historias-roblox-cidade-7olib1`).
A pessoa aprovou o resultado ("o vídeo ficou bom").

**Motor padrão = `kit-cidade/`** (no mesmo repositório), Remotion + three.js. Funciona na nuvem sem
Blender, sem GPU e sem Flashloop. **Não refaça personagens, texturas ou cenários do zero: crie o vídeo a
partir do kit** (`kit-cidade/scripts/novo_video.sh <slug> <narracao.mp3>`; o README do kit tem os comandos).
O Blender + Flashloop do `roblox-story-kit` só vale numa máquina da pessoa que tenha os dois.

**Narração:** a pessoa manda o MP3 pronto, então não gere voz. Transcreva com `scripts/transcrever.py`
(faster-whisper medium, PT). O host `huggingface.co` já está liberado no ambiente. Não mexa no tempo da
voz dela (sem `retempo`/`tighten`).

**Narrador:**
- O visual é sempre o **Max**: 14 anos, moletom vermelho, camiseta branca, calça cargo grafite, tênis
  vermelho e branco, cabelo castanho volumoso e bagunçado.
- Na narração ele se chama **Teco**; a pessoa decidiu manter esse nome. Faixas e placas usam "Teco".
- Ficha completa: `kit-cidade/assets/characters/max/manifest.json`.
- Modelo: `src/Max.tsx`.
- Imagem de referência: `max_conceito_frente.png`.
- Não há parada para escolher narrador: ele já existe.

**Customuse (MCP `mcp__Customuse__*`) — gastar o mínimo possível:**
- Já foram gastos 38 créditos (conceito 11 + multiview 27); saldo após o 1º vídeo: 472.
- Workflow "Max — base": https://customuse.com/workflow/c86eb4a2-a24d-4472-a9d3-a8732010c442
- Toda geração paga precisa de **aprovação explícita da pessoa, passo a passo**. Antes, diga o custo:
  `customuse_estimate_image_generation` para imagem (11 créditos em 1K); multiview custou 27.
  Roblox 3D, rig e animação não têm estimativa: avise que o preço só aparece ao rodar.
- Use o Customuse só para **conceito/referência** de personagem novo. O vídeo usa o modelo em código,
  que custa zero. Só gere o modelo 3D do Customuse se a pessoa quiser levar o personagem ao Roblox.
- Para baixar os resultados, `public.customuse.com` já está liberado no ambiente.

**Prévia visual cedo:** a pessoa quer ver imagens assim que possível. Mande pelo `SendUserFile`:
1. o conceito ao lado do personagem no motor;
2. a contact sheet numerada dos planos;
3. o vídeo final e a capa.

**Correções do 1º vídeo que já estão no kit (não pedir de novo):**
- **Parede:** papel de parede em cima e lambri pintado embaixo, com sanca, rodameio e rodapé
  (`T.wallPanel`). Não use mais papel de parede chapado.
- **Chão interno:** assoalho de tábuas de comprimento variado, emendas, veio e nós (`T.floor`).
- **Chão externo:** calçamento irregular com sombra e musgo (`T.cobble`).
- **Cabelo de verdade em todos:** mechas de bloco arredondadas, nunca uma tampa lisa.
  - Jovens: `messy`, `spiky`, `long`, `pigtails`, `short`.
  - Idosos: `old` (topo calvo, tufos brancos nas laterais e na nuca) e `oldBun`.
  - O velho e o avô usam `old`; a multidão tem idosos de cabelo branco.
- **Relógio:** tem ponteiros e algarismos romanos (`T.clock(h, m)`).
- **Figurantes:** paleta sóbria, porque o vermelho é do Max.

**Se a pessoa reclamar de algo visual**, corrija no `kit-cidade/` (não só no vídeo) e anote aqui, para
valer em todos os próximos.

## Regras que nunca mudam

1. **Tudo em português do Brasil**: narração, legendas, placas, bilhetes, cartazes e título da capa.
   Só fazer em inglês se o pedido disser "em inglês".
2. **Histórias originais.** As referências ensinam estrutura, ritmo e linguagem de câmera. Nunca
   reaproveitar a trama, a regra, os nomes ou as falas de um vídeo do canal de referência
   (nada de caixa de areia sem fundo, cajado na neblina, abraço que troca idade).
3. **Sem personagens protegidos.** O narrador do canal de referência usa um gorro de alienígena verde de
   três olhos (de um filme da Pixar). O nosso mascote é **original**: nada de gorro de alien, orelhas,
   antenas ou qualquer coisa que lembre um personagem conhecido. Sem UI, logos ou sons reais do Roblox.
4. **Elenco fixo, reaproveitado.** O narrador é sempre o mesmo mascote (ver "Elenco"). Personagens
   desenhados uma vez ficam em `characters/` e voltam em todo vídeo.
5. Continuam valendo: uma pasta por vídeo (checagem do Flashloop só no pipeline Blender),
   tempo por índice de palavra, câmera sempre em movimento, preview + contact sheet antes do render final,
   QA do arquivo final, capa.

## Antes de começar (só no pipeline Blender + Flashloop; na nuvem, siga o "Pipeline na nuvem")

1. Faça o passo 0 do `roblox-story-kit` (Flashloop, workspace, `PY`, voz). Se o kit não estiver
   instalado, rode o setup dele primeiro.
2. **Ajustes do canal, uma vez por workspace** (confira com `kit.py get` e só grave se faltar):
   ```
   $PY tools/kit.py set whisper_model medium      # modelo multilíngue: o ".en" não entende português
   $PY tools/kit.py set music_mode tempo
   ```
3. Salve o script de legenda do canal (fim deste arquivo) em `<workspace>/tools/legendas_canal.py`
   se ainda não existir.

## Como uma rodada acontece

O pedido é o briefing. O que ele não disser (ideia, nomes, título), decida sozinho, sem perguntar.

- O narrador (Max/Teco) já existe, então **não há parada para escolher personagem**. Vá da narração ao
  vídeo pronto, mandando prévias visuais no caminho (contact sheet e depois o final).
- Personagem novo e recorrente: faça em código no kit. Só use o Customuse (pago) se a pessoa aprovar.
- "autopilot" no pedido: nenhuma parada mesmo no primeiro vídeo.
- "me dá ideias": responda com 10 ideias no formato do banco de ideias, sem produzir nada.

## Formatos

| | **Longo (padrão)** | **Curto** |
| --- | --- | --- |
| Duração | 2:30-3:00 | 55-70 s |
| Palavras (PT) | 560-650 | 210-250 |
| Tom | mistério / sombrio com virada | coração (emocionante, final doce) ou mistério compacto |
| Pedido | padrão | "curto", "de 1 minuto" |

Os dois longos de referência têm 2:58; o curto tem 1:02. O longo custa mais voz (~4 créditos por
caractere: ~3.600-4.000 caracteres ≈ 15.000 créditos) e renderiza por mais tempo (~2-3 h numa GPU de
notebook gamer). Diga isso no relatório final, não pare para perguntar.

## Os números do canal (medidos nas 3 referências)

| Métrica | Referência | Meta em português |
| --- | --- | --- |
| Primeira palavra | 0,00-0,25 s | 0,00 s, sem intro nem título |
| Ritmo da fala | 230-265 palavras/min (inglês) | 215-235 palavras/min (palavras em PT são mais longas) |
| Palavras nos primeiros 15 s | 57-68 | 52-60 |
| Cortes por minuto | 52-53 | 50-55 |
| Plano médio | ~1,15 s | 1,0-1,3 s |
| Pausas > 0,3 s | nenhuma (trilha contínua por baixo) | nenhuma pausa > 0,45 s na voz; trilha nunca para |
| Legenda | 1 palavra, minúscula, branca, contorno preto fino, ~70% da altura | idem (script no fim) |

Processamento de voz (no lugar dos números do kit):
```
$PY tools/voice_run.py --video <slug> --voice videos/<slug>/audio/raw.mp3 --speed 1.1
$PY tools/tighten.py <slug> --max-gap 0.40
$PY tools/retempo.py <slug> --wpm 225          # inglês: --wpm 250
```

## A fórmula do roteiro

Narrador: menino de ~12 anos, **primeira pessoa, passado**, frases de 3-12 palavras, zero floreio.
Conectores secos: "Então", "Mas", "Aí", "Até que". Números concretos o tempo todo (anos, idades,
quantidades, medidas). O humor e o medo vêm de detalhes do cotidiano tratados com seriedade.

### Longo: mistério com virada (8 blocos)

1. **Regra no primeiro segundo (0-4 s).** "Nesta cidade, [regra impossível em uma frase]." Diferente do
   kit, a regra vem **antes** de tudo, dita como fato. Termina na palavra mais visual. Segue com 1 frase
   da consequência ("…e ninguém nunca mais vê você").
2. **Como a cidade se adaptou (4-25 s).** 3-5 costumes concretos e visuais, cada um com seu plano: um
   objeto marcado (uma linha pintada, uma placa de regra), uma proibição esquisita, um treino das
   crianças com tempo cronometrado, um animal ou objeto que não existe na cidade e por quê.
   Uma **estatística** ("já foram 312 brinquedos", "um por ano há 208 anos") e um **incidente
   histórico com ano** ("em 1990, um menino…").
3. **A família e o bordão (25-45 s).** "Minha irmãzinha [nome] tem 5 anos." O que ela ama, do que tem
   medo, e **o bordão**: uma frase curta + um gesto que o narrador repete todo dia ("eu sempre te tiro
   de lá" / "não solta" + três apertos de mão). O bordão volta no final com outro sentido. Se fizer
   sentido, um traço especial do narrador ("comigo nunca acontece").
4. **O aviso ignorado (~30-40%).** Um velho rabugento da vizinhança passa um bilhete enigmático por baixo
   da porta ou pela fresta do correio. A cidade descarta com um motivo ("ele é amargo desde que…").
5. **O incidente (~40-50%).** "Até que, três semanas atrás…" A regra pega a irmã (ou quebra o padrão:
   vem mais cedo, leva mais gente). Reação de choque, mãe gritando, pai tentando e sendo contido.
6. **A mobilização (50-75%).** O narrador tem a ideia e convence a cidade inteira. Escada numérica a
   cada 8-12 s ("três metros… seis… nove… doze"; "seis dias", "406 crianças"). Sinais misteriosos
   reforçam que vale a pena continuar.
7. **Falsa vitória (~75%).** Dá certo. Festa, fogueira, sinos, a cidade grita o nome do narrador.
8. **A virada e a última fala (últimos 15-20%).** "Aí eu entendi o bilhete do [velho]." Revelação
   lógica que usa as pistas plantadas: **o narrador era a ferramenta** (isca, cão pastor, a escada) e a
   coisa por trás da regra sempre esteve no controle. O bordão volta com sentido sombrio. Mostrar a
   ameaça só em parte (um braço, uma sombra, um gancho), nunca inteira. **Última linha: a coisa fala,
   1-3 palavras** ("obrigado.", "bom garoto."). Corta seco.

Tipos de virada para variar: *você era a ferramenta*, *a ajuda era isca*, *o velho tinha razão*,
*a regra tinha uma segunda metade que ninguém conhecia*, *quem mandava os sinais não era quem você
achava*.

### Curto: coração (6 blocos)

1. "Nesta cidade, se você [ato comum], [efeito impossível]." + como funciona em 1 frase.
2. Por isso ninguém aqui faz isso: 2-3 exemplos rápidos e engraçados (casamento, bebê, vizinho).
3. A ocasião: uma data da família (aniversário de 90 anos do avô) e um desejo dito sem palavras.
4. O narrador usa a regra de propósito, sabendo o preço. Efeito em 3 batidas no corpo ("minhas costas
   estalaram, meus joelhos rangeram, meu cabelo ficou branco").
5. Montagem de lista: 4-6 coisas que o outro faz com o presente (cada uma 1 plano, 1 frase).
6. Volta ao normal + **tradição**: "Agora, todo ano…" Última linha curta e doce.

### Checklist do roteiro (antes da voz)

- [ ] Primeira frase é a regra, termina em palavra visual.
- [ ] Pelo menos 3 números concretos nos primeiros 25 s.
- [ ] Bordão plantado antes da metade e repetido na virada.
- [ ] Bilhete do velho plantado antes do incidente (longo).
- [ ] Toda pista da virada já apareceu antes; nada inventado no fim.
- [ ] Última linha: 1-3 palavras (longo) ou tradição doce (curto).
- [ ] Contagem de palavras dentro da faixa do formato.

## Elenco

| Papel | Chave | Como é |
| --- | --- | --- |
| **Narrador** | `max` (alias `teco`) | **MAX**: 14 anos, cabeça quadrada, cabelo castanho volumoso e bagunçado, olhos castanhos com brilho, moletom vermelho com capuz em V, camiseta branca, calça cargo grafite, tênis vermelho e branco. Mochila só se a história pedir. Falado como "Teco". Código: `src/Max.tsx`; ficha: `assets/characters/max/`. Aparece em todo vídeo, sempre igual. |
| Irmãzinha | `lia` | 5-6 anos, maria-chiquinha ou franja, roupa de cor quente. Nome muda por história se quiser. |
| Velho rabugento | `velho` | Barba branca, cabelo de velho (`old`: topo calvo e tufos brancos), boina, roupa escura e gasta. |
| Mãe, pai | `mae`, `pai` | Simples, cores sóbrias. |
| Avô | `avo` | Cabelo branco `old`, óculos, suéter bege. |
| A coisa | `sombra` | Silhueta preta de bloco; aparece só em parte, com olhos acesos. |
| Multidão | elenco do kit (`kid(i)`, `townie`, `crowd`) | Sem ficha. |

Primeiro vídeo: os 3 designs do kit (passo 2) são para o **narrador**, usando o template de ficha do kit
com o item-assinatura descrito acima e a frase "no alien hat, no antennae, no ears on the hat, not
resembling any existing character". Salvar como `characters/narrador.json` + `narrador_sheet.jpg`.
`irma` e `velho` ganham ficha sem perguntar na primeira vez em que aparecerem e são reaproveitados
depois (só o nome falado muda).

Visual dos personagens nas referências: avatares com roupa com textura de tecido (tricô listrado,
xadrez, moletom), rostos de expressão grande que mudam na palavra-chave. Peça no prompt da ficha
"knitted / plaid fabric texture on the shirt" quando combinar.

## Visual e câmera (substitui as seções 4-6 do PLAYBOOK do kit onde divergir)

- **Mundo realista com personagens de bloco.** Chão e paredes com textura (paralelepípedo, madeira,
  grama, tijolo, papel de parede florido), postes, cercas brancas, igreja com torre de relógio, casas
  geminadas. Nunca cor lisa no chão.
- **Arco de luz que acompanha a história:** dia ensolarado no começo → céu nublado e neblina quando a
  regra aperta → noite com fogueira quente na mobilização/festa → noite fria e escura na virada.
- **Gramática de planos do canal:**
  - close médio no rosto (cabeça + ombros) é a base; a expressão muda na palavra do susto;
  - **plongée de cima** para multidões e formas (círculo de crianças de mãos dadas, buraco visto de cima);
  - **contra-plongée** para a ameaça (o objeto gigante descendo do céu, a sombra na parede);
  - **inserts de textura** para placas, bilhetes, cartazes e números: todo texto é uma textura Flashloop
    em português, legível em 0,5 s, letra de criança com giz de cera para bilhetes da "coisa";
  - o **bordão** é filmado igual nas duas vezes (mesmo ângulo, mesmo gesto) para o público reconhecer;
  - estabelecimento aberto do lugar a cada troca de local, depois volta ao rosto.
- **Câmera:** sempre em movimento (push-in lento é o padrão do canal; crash zoom e whip só no susto e
  nos primeiros 3 s). Menos tremido que o padrão do kit: o tom é de narração, não de pânico.
- **Legenda é dona da faixa de 62-78% da altura**: rostos, placas e mãos ficam acima disso.

## Som

- Trilha **contínua e baixa**, nunca some (as referências não têm nenhum silêncio). Mistério: piano ou
  pad calmo e levemente inquietante. Coração: violão/piano doce. Pegue a trilha certa com
  `finish.py --music <arquivo>`; se a pasta `music/` só tiver a trilha padrão do kit e o tom for
  sombrio, use-a com `--music-db -18` e diga no relatório que uma trilha própria fica melhor.
- Efeitos **discretos e do que acontece em cena** (passos, rangido de madeira, vento, papel, apito
  distante, sino, fogueira), não estrondos. Só a virada ganha um impacto mais grave. Sons que o pacote
  do kit não tem (apito longo, respiração, rangido) são sintetizados com numpy como o kit ensina.

## Pipeline na nuvem com o kit-cidade (padrão)

1. `git fetch` + checkout do branch de trabalho. Crie o vídeo com
   `kit-cidade/scripts/novo_video.sh <slug> <mp3>`; o MP3 enviado pela pessoa fica em `/root/.claude/uploads/...`.
2. Rode `python3 scripts/transcrever.py`. Leia a lista `índice:palavra@segundo`. Corrija erros do Whisper
   no `words.json` e no `src/words.json`.
3. Escreva o `src/shots.tsx`. São 50-55 planos por minuto e cada plano começa numa palavra (`w`).
   - Siga a gramática de câmera do canal.
   - Reaproveite os sets (`Town`, `RockSite`, `Rooms`, `Sala`, `Trail`, `Cave`, `Pieces`) e crie um set
     novo por local quando a história pedir.
   - Use os climas `day`, `cloudy`, `dusk`, `fire`, `cold`, `roomNight`, `roomDay`, `cave` e `void`.
4. Faça a contact sheet numerada (`node scripts/starts.mjs && node scripts/stills.mjs EcoPreview mid`),
   abra a imagem e corrija os planos ruins (checklist abaixo). Mande a sheet para a pessoa.
5. No `scripts/som.py`, ajuste as seções da trilha (em segundos) e os cues de SFX (índice de palavra).
   Depois rode e confirme: nenhum silêncio maior que 0,3 s e cerca de -14 LUFS.
6. Rode `npx remotion render Eco out/final_nocaptions.mp4` em segundo plano. Leva ~1 s por frame em 4 CPUs.
7. Rode `python3 scripts/legendas_canal.py` (Montserrat ExtraBold instalada em `~/.fonts`).
   - Na legenda, nomes próprios (Teco, Lia) mantêm a maiúscula.
8. QA: contact sheet do `final.mp4`, `blackdetect` e `ebur128`.
9. Capa: frame mais tenso + título de 2-4 palavras com `drawtext` (Montserrat).
10. Copie `final_phone.mp4` e a capa para `entrega/`, faça commit e push, e mande o vídeo e a capa
    para a pessoa.

### Checklist de planos (erros que já aconteceram — conferir na contact sheet)
- **Câmera:**
  - Câmera dentro de casa, montanha ou pedra deixa o plano preto ou cinza. Confira as caixas dos sets:
    as casas ocupam ±3 m e a montanha tem raio de ~70 m.
  - Ator escondido dentro da parede: coloque-o na frente da fachada (a fachada fica em z = centro + 3).
  - Elementos atrás da montanha (anéis de eco, lua, figura) ficam invisíveis.
    Ponha-os na frente: z > -20.
- **Rosto de costas:**
  - Personagem de costas no grito ou no cochicho: a câmera fica **entre** ele e o alvo, olhando de volta.
  - A pose `lean` inclina a cabeça para a frente: câmera baixa (~0,85 m) e frontal 3/4.
- **Textura e texto:**
  - Placas e bilhetes devem caber no quadro: largura visível ≈ 0,47 × distância (fov 45, 9:16).
  - Placa em close usa `basic`, para não sumir na noite.
  - Texturas com fonte (Caveat, Montserrat) são criadas **dentro** do componente/função, nunca no topo
    do módulo; senão a fonte ainda não carregou.
- **Luz:**
  - Brilho (sprite) em close não pode estourar a tela: tamanho de ~2-3 m e opacidade ≤ 0,55.
  - Sprite atrás de névoa precisa de `fog={false}`.
  - Noite precisa ser legível: hemisfério ≥ 0,7 e sol/lua ≥ 0,7.
- **Escala e pose:**
  - O Max tem escala 0,92 (cabeça a ~1,15 m), como os planos assumem.
  - Para sentar: `sit`/`sitcover` com o ator em y = altura do assento.
- **Repetição e sombra:**
  - O bordão é filmado igual nas duas vezes.
  - A ameaça aparece só em parte.
  - Sombras reais (shadow map) e luz de recorte já estão no `Env`.

## Pipeline com Blender + Flashloop (só numa máquina com os dois)

1. **Ideia + roteiro** com a fórmula acima → `videos/<slug>/script.txt` em português. Rode o checklist.
2. **Personagens**: narrador (parada só no primeiro vídeo), `irma`/`velho` reaproveitados.
3. **Voz**: `script_text.py` → `flashloop_generate_voiceover` com `language_code: "pt"`. Antes da
   primeira narração em português do canal, gere **uma frase de teste** com a voz clonada do kit. Se o
   sotaque não soar brasileiro, escolha em `flashloop_list_voices` uma voz masculina jovem em PT-BR,
   grave com `kit.py set flashloop_voice_id <id>` e use sempre ela. Tom: calmo, de quem conta um
   segredo, sem gritar.
4. **Processamento da voz** com os números do canal (acima). Confira `words.json`: 215-235 ppm,
   52-60 palavras antes de 15 s.
5. **Texturas** em português: placa de regras do lugar, bilhete do velho, bilhetes da "coisa", contador,
   cartaz da cidade. Reaproveite as que já existem em `assets/tex/`.
6. **SFX** discretos (seção Som).
7. **Shots** (`shots.py`): 50-55 cortes/min, gramática do canal, arco de luz. No longo, monte um set por
   local e filme de 6-10 ângulos; 4-6 locais no vídeo todo.
8. **Preview + contact sheet** como no kit; confira também: legenda livre, texto das placas legível,
   bordão filmado igual nas duas vezes, ameaça nunca inteira.
9. **Render final** como no kit (em segundo plano).
10. **Finalizar**: `$PY tools/finish.py <slug> --music <trilha>` e depois
    `$PY tools/legendas_canal.py <slug>` (refaz `out/final.mp4` e `final_phone.mp4` com a legenda do
    canal por cima de `final_nocaptions.mp4`).
11. **QA do arquivo final** como no kit.
12. **Capa**: frame mais tenso + título de 2-4 palavras em **português** ("NÃO SOLTA", "CAVA MAIS
    RÁPIDO"), branco com contorno preto.
13. **Relatório**: onde estão vídeo e capa, créditos gastos, tempo de render, o que não foi conferido.
    Peça para a pessoa assistir com som (não dá para ouvir a mixagem daqui).

## Banco de ideias (originais; marque as usadas)

Mistério (longo):
1. Nesta cidade, a sombra de cada criança sai para brincar sozinha à meia-noite. Uma noite, a da minha
   irmã não voltou. *(virada: a sombra voltou, a irmã é que foi)*
2. Nesta escola, o sinal do recreio toca uma vez a mais por ano, e quem estiver no pátio some.
   *(virada: o narrador que "salvou" todos deixou o pátio cheio)*
3. Nesta praia, a maré devolve tudo o que alguém jogou fora, anos depois. *(virada: a cidade jogou
   alguém fora)*
4. Neste prédio, o elevador tem um andar a mais depois das dez da noite. *(virada: os bilhetes de
   socorro eram para atrair quem consertasse o elevador)*
5. Nesta cidade, os espantalhos mudam de lugar quando ninguém olha, e todo ano um aponta para uma casa.
   *(virada: eles apontavam para proteger, não para escolher)*
6. Nesta vila, toda casa deixa uma luz acesa a noite inteira. A única que apagou foi a do velho
   rabugento. *(virada: ele apagou de propósito para atrair a coisa para longe das crianças)*
7. Neste parque, o carrossel gira sozinho e cada volta tira um dia da sua idade. *(virada: alguém
   está dando voltas há 60 anos)*
8. ✅ FEITO — Nesta cidade, o eco da montanha responde qualquer pergunta, mas cobra um segredo por resposta.
   *(virada: o eco estava juntando segredos para virar uma pessoa)*

Coração (curto):
9. Nesta cidade, quando você ri, a pessoa mais triste perto de você ganha um minuto de alegria.
10. Nesta cidade, quem dá a mão para alguém sente tudo o que essa pessoa sente.
11. Nesta cidade, no seu aniversário, você pode devolver um ano para alguém, mas fica um ano mais velho.
12. Nesta cidade, a neve só cai em quem não mentiu naquele dia.

Feitos: 8 (*O eco da montanha*, nov/2026).

## Medir novas referências

Se a pessoa mandar mais vídeos do canal de referência, meça em vez de opinar:
- cortes: `ffmpeg -i v.mp4 -vf "scale=270:-2,scdet=threshold=10:sc_pass=0" -an -f null - 2>&1 | grep -c scd.time`
- transcrição: `tools/analyze_inspo.py` do kit (Whisper). Sem Whisper, leia a legenda queimada com OCR
  (tesseract) na faixa de 63-77% da altura a 8 fps.
- contact sheet: `ffmpeg -i v.mp4 -vf "fps=12/<duração>,scale=240:-1,tile=6x2" -frames:v 1 sheet.jpg`.
Atualize a tabela de números e a fórmula com o que mudar. Aprenda só a estrutura, nunca a trama.

## Script de legenda do canal (versão do kit: `kit-cidade/scripts/legendas_canal.py`; abaixo, a versão para o kit Blender)

```python
"""Legendas no estilo do canal: uma palavra por vez, minúsculas como faladas (nomes próprios mantêm
maiúscula), branco com contorno preto fino, ~70% da altura. Queima sobre out/final_nocaptions.mp4 e
regrava out/final.mp4 e out/final_phone.mp4.
uso: python legendas_canal.py <slug> [--workspace DIR] [--font "Montserrat ExtraBold"] [--size 96] [--y 1350]"""
import argparse, json, os, re, subprocess

ap = argparse.ArgumentParser()
ap.add_argument("slug"); ap.add_argument("--workspace", default="")
ap.add_argument("--font", default="Montserrat ExtraBold"); ap.add_argument("--size", type=int, default=96)
ap.add_argument("--y", type=int, default=1350)
o = ap.parse_args()
ws = o.workspace or json.load(open(os.path.expanduser("~/.roblox-story-kit.json")))["workspace"]
vdir = os.path.join(os.path.expanduser(ws), "videos", o.slug)
words = json.load(open(os.path.join(vdir, "audio", "words.json"), encoding="utf-8"))
LAG = 1.3 / 30


def ts(t):
    cs = int(round(max(t, 0) * 100))
    return f"{cs // 360000}:{cs // 6000 % 60:02d}:{cs // 100 % 60:02d}.{cs % 100:02d}"


def k(w, *names):
    for n in names:
        if n in w: return w[n]


head = f"""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Word,{o.font},{o.size},&H00FFFFFF,&H00FFFFFF,&H00000000,&H78000000,-1,0,0,0,100,100,0,0,1,6,2,5,20,20,20,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines = []
for i, w in enumerate(words):
    raw = k(w, "word", "w")
    txt = re.sub(r"[^\w'\-]", "", raw).strip("-")
    if not txt: continue
    first_of_sentence = i == 0 or re.search(r"[.!?]$", k(words[i - 1], "word", "w") or "")
    if first_of_sentence and (len(txt) == 1 or txt[1:].islower()):  # só nome próprio fica com maiúscula
        txt = txt.lower()
    s = 0.0 if i == 0 else k(w, "start", "s") + LAG
    e = (k(words[i + 1], "start", "s") + LAG) if i + 1 < len(words) else k(w, "end", "e") + 0.4
    lines.append(f"Dialogue: 0,{ts(s)},{ts(e)},Word,,0,0,0,,{{\\pos(540,{o.y})}}{txt}")
ass = os.path.join(vdir, "captions_canal.ass")
open(ass, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")

os.chdir(vdir)
src = os.path.join("out", "final_nocaptions.mp4")
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", src],
                           capture_output=True, text=True).stdout)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", src, "-vf", "ass=captions_canal.ass", "-c:v", "libx264", "-preset",
                "slow", "-crf", "16", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart",
                os.path.join("out", "final.mp4")], check=True)
vbr = max(800, int(25 * 8 * 1024 / dur) - 160)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", os.path.join("out", "final.mp4"), "-vf", "scale=720:1280", "-c:v",
                "libx264", "-preset", "slow", "-b:v", f"{vbr}k", "-maxrate", f"{int(vbr * 1.2)}k", "-bufsize",
                f"{vbr * 2}k", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart",
                os.path.join("out", "final_phone.mp4")], check=True)
print("pronto:", os.path.join(vdir, "out", "final.mp4"), f"{len(lines)} palavras")
```

Se a fonte Montserrat não estiver instalada, o libass usa uma substituta; passe `--font "Arial Black"`
(Windows/Mac) para ficar mais próximo. O `\w` do regex mantém acentos e cedilha.