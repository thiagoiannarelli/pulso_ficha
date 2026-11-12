# PULSO · Ficha de Treino Inteligente

Site estático (HTML, CSS e JavaScript puro). A pessoa preenche medidas, objetivo, rotina e hábitos, e o site monta um treino de academia personalizado com recomendações de alimentação, sono e hidratação. O resultado pode ser salvo em PDF ou impresso.

Não tem build, banco de dados nem dependências: é só subir e publicar.

## Estrutura

```
pulso-ficha/
├── index.html                  # página (hero + formulário em 3 etapas)
├── css/style.css               # visual + versão de impressão (A4)
├── js/plano.js                 # motor que gera o treino (regras de treino e dicas)
├── js/app.js                   # interface: etapas, validação, IMC ao vivo, resultado
├── public/ficha-preenchivel.pdf# ficha em PDF preenchível (botão "Baixar ficha em PDF")
└── vercel.json                 # configuração da Vercel
```

## Rodar no computador

Abra o `index.html` no navegador. Se preferir rodar como servidor:

```bash
npx serve .
# ou
python3 -m http.server 8000
```

## Subir no GitHub

1. Crie um repositório vazio em https://github.com/new (ex.: `pulso-ficha`).
2. No terminal, dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "Ficha de treino inteligente"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/pulso-ficha.git
git push -u origin main
```

Sem terminal: no repositório recém-criado, clique em **"uploading an existing file"** e arraste todos os arquivos e pastas.

## Publicar na Vercel

1. Entre em https://vercel.com e faça login com o GitHub.
2. Clique em **Add New → Project** e importe o repositório `pulso-ficha`.
3. Em **Framework Preset**, deixe **Other**. Não preencha Build Command nem Output Directory.
4. Clique em **Deploy**. Em cerca de 1 minuto o site fica no ar em `pulso-ficha.vercel.app`.

Depois disso, a cada `git push` a Vercel publica a nova versão sozinha.

## Personalizar

- **Marca:** troque "PULSO" no `index.html` (logo, título e rodapé).
- **Cores:** variáveis no topo do `css/style.css` (`--lime`, `--ink`...).
- **Exercícios e regras:** em `js/plano.js`. O objeto `E` é a biblioteca de exercícios (com alternativas para joelho, lombar e ombro), `T` são os treinos e, logo abaixo, ficam as divisões por dia e os parâmetros por objetivo.

## Aviso

O conteúdo traz orientações gerais e não substitui a avaliação de um médico, de um(a) profissional de Educação Física (CREF) e de um(a) nutricionista.
