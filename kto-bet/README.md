# KTO Bet - Frontend Design System

Projeto frontend completo do site de apostas KTO Bet desenvolvido com Next.js 14, TypeScript e Tailwind CSS.

## 📁 Estrutura do Projeto

```
kto-bet/
├── src/
│   ├── components/
│   │   ├── common/       # Componentes reutilizáveis (Icon, Button, etc.)
│   │   ├── games/        # GameCard, GamesReel
│   │   ├── layout/       # Navbar, Footer, Header
│   │   └── seo/          # ContentBox, FAQ
│   ├── data/
│   │   └── homepage.ts   # Dados mockados
│   ├── lib/
│   │   └── utils.ts      # Utilitários (cn)
│   ├── styles/
│   │   └── globals.css   # CSS global com design tokens
│   ├── types/
│   │   └── index.ts      # Tipos TypeScript
│   └── app/
│       ├── layout.tsx    # Layout principal
│       └── page.tsx      # Página inicial
├── public/
│   └── images/           # Assets estáticos
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

## 🚀 Instalação

```bash
cd kto-bet
npm install
npm run dev
```

Acesse `http://localhost:3000`

## 🎨 Design Tokens

### Cores
- **Primary**: `#DA0000` (Vermelho KTO)
- **Secondary**: `#00DD70` (Verde Sucesso)
- **Tertiary**: `#FAD749` (Amarelo Atenção)
- **Surface Background**: `#FFFFFF`
- **Surface Card**: `#f4f3ed`
- **Surface Card Highlight**: `#ff6767`

### Tipografia
- **Fonte Principal**: Inter (100-900)
- **Fonte Branded**: NNSwintonSTD (Bold Italic)
- **Base**: 17px

### Espaçamento
- quarck: `0.235rem` | nano: `0.471rem` | xs: `0.706rem`
- sm: `0.941rem` | md: `1.412rem` | bg: `1.882rem`
- xl: `2.353rem` | 2xl: `2.824rem` | 3xl: `3.765rem`

## 🧩 Componentes Implementados

1. **Navbar** - Navegação fixa com menu mobile
2. **HeroCarousel** - Banner principal com autoplay
3. **USPStrip** - Faixa de vantagens
4. **ReelNav** - Atalhos de navegação horizontal
5. **GamesReel** - Carrossel de jogos de cassino
6. **GameCard** - Card individual de jogo
7. **CTABannerList** - Chamada para ação em 3 passos
8. **ContentBox** - Conteúdo SEO expansível
9. **Footer** - Rodapé completo

## 📊 SEO & Performance

- Meta tags OG e Twitter Cards
- Schema.org JSON-LD (WebPage, Organization, FAQ)
- Lazy loading de imagens
- Priority load no banner principal
- Fontes com preload

## ♿ Acessibilidade

- Skip to main content link
- ARIA landmarks (header, main, nav, footer)
- Focus management no mobile menu
- Alt texts em todas as imagens

## 📝 Próximos Passos

1. Implementar componentes restantes (HeroCarousel, GamesReel, Footer)
2. Adicionar imagens reais na pasta `/public/images`
3. Configurar fontes Inter e NNSwintonSTD no `_document.tsx`
4. Implementar schema JSON-LD completo
5. Adicionar testes unitários

## 📄 Licença

Projeto demonstrativo para fins educacionais.
