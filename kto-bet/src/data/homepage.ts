import { Game } from '@/types';

export const casinoGames: Game[] = [
  {
    name: 'Fortune Tiger',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_fortunetiger/',
    imageUrl: '/images/games/fortune-tiger.jpg',
    badges: ['Top'],
  },
  {
    name: 'Fortune Rabbit',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_fortunerabbit/',
    imageUrl: '/images/games/fortune-rabbit.jpg',
    badges: ['Top'],
  },
  {
    name: 'Aviator',
    provider: 'Spribe',
    providerUrl: '/provider/spribe',
    gameUrl: '/cassino/game/SPRIBE_AVIATOR/',
    imageUrl: '/images/games/aviator.jpg',
    badges: ['Top'],
  },
  {
    name: 'Fortune Ox',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_fortuneox/',
    imageUrl: '/images/games/fortune-ox.jpg',
    badges: ['Top'],
  },
  {
    name: 'Fortune Mouse',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_fortunemouse/',
    imageUrl: '/images/games/fortune-mouse.jpg',
    badges: ['Top'],
  },
  {
    name: 'Fortune Dragon',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_fortunedragon/',
    imageUrl: '/images/games/fortune-dragon.jpg',
    badges: ['Top'],
  },
  {
    name: 'Cash Mania',
    provider: 'PG Soft',
    providerUrl: '/provider/pg-soft',
    gameUrl: '/cassino/game/pgs_cashmania/',
    imageUrl: '/images/games/cash-mania.jpg',
    badges: ['Top'],
  },
  {
    name: 'Tigre Sortudo',
    provider: 'Pragmatic Play',
    providerUrl: '/provider/pragmatic-play',
    gameUrl: '/cassino/game/tigre-sortudo-pp/',
    imageUrl: '/images/games/tigre-sortudo.jpg',
    badges: ['Top'],
  },
];

export const liveCasinoGames: Game[] = [
  {
    name: 'Roleta Brasileira',
    provider: 'Evolution',
    providerUrl: '/provider/evolution',
    gameUrl: '/cassino/game/roleta-brasileira-ao-vivo/',
    imageUrl: '/images/games/roleta-brasileira.jpg',
  },
  {
    name: 'Roleta Relâmpago Brasileira',
    provider: 'Evolution',
    providerUrl: '/provider/evolution',
    gameUrl: '/cassino/game/roleta-relampago-brasileira/',
    imageUrl: '/images/games/roleta-relampago.jpg',
  },
  {
    name: 'Bac Bo',
    provider: 'Evolution',
    providerUrl: '/provider/evolution',
    gameUrl: '/cassino/game/bac-bo/',
    imageUrl: '/images/games/bac-bo.jpg',
  },
  {
    name: 'Mega Fire Blaze Lucky Ball',
    provider: 'Playtech',
    providerUrl: '/provider/playtech',
    gameUrl: '/cassino/game/mega-fire-blaze-lucky-ball-brasileiro/',
    imageUrl: '/images/games/lucky-ball.jpg',
  },
  {
    name: 'Crazy Time',
    provider: 'Evolution',
    providerUrl: '/provider/evolution',
    gameUrl: '/cassino/game/crazy-time/',
    imageUrl: '/images/games/crazy-time.jpg',
  },
  {
    name: 'Mega Roleta Brasileira',
    provider: 'Playtech',
    providerUrl: '/provider/playtech',
    gameUrl: '/cassino/game/mega-roleta-brasileira-ppl/',
    imageUrl: '/images/games/mega-roleta.jpg',
  },
  {
    name: 'Football Studio Live',
    provider: 'Evolution',
    providerUrl: '/provider/evolution',
    gameUrl: '/cassino/game/football-studio/',
    imageUrl: '/images/games/football-studio.jpg',
  },
  {
    name: 'Adventures Beyond Wonderland',
    provider: 'Playtech',
    providerUrl: '/provider/playtech',
    gameUrl: '/cassino/game/adventures-beyond-wonderland-live/',
    imageUrl: '/images/games/wonderland.jpg',
  },
];

export const slides = [
  {
    id: 1,
    headline: 'JOGUE COM CONFIANÇA',
    subtitle: 'É rápido e fácil. Pode apostar! Cadastre-se agora e ganhe bônus exclusivos.',
    ctaText: 'Registre-se agora!',
    ctaUrl: '/register',
    bgColor: '#DA0000',
    textColor: '#FFFFFF',
    mobileImage: '/images/banner-mobile-1.jpg',
    desktopImage: '/images/banner-desktop-1.jpg',
  },
  {
    id: 2,
    headline: 'CASHBACK SEMANAL',
    subtitle: 'Receba de volta parte das suas apostas toda segunda-feira.',
    ctaText: 'Saiba mais',
    ctaUrl: '/promocoes/cashback',
    bgColor: '#000000',
    textColor: '#FAD749',
    mobileImage: '/images/banner-mobile-2.jpg',
    desktopImage: '/images/banner-desktop-2.jpg',
  },
  {
    id: 3,
    headline: 'AO VIVO AGORA',
    subtitle: 'As melhores odds do mercado para jogos acontecendo neste momento.',
    ctaText: 'Apostar Agora',
    ctaUrl: '/ao-vivo',
    bgColor: '#004400',
    textColor: '#00DD70',
    mobileImage: '/images/banner-mobile-3.jpg',
    desktopImage: '/images/banner-desktop-3.jpg',
  },
];

export const usps = [
  { text: 'Ganho Antecipado' },
  { text: 'Ótimas odds no Brasil' },
  { text: 'Saque na hora' },
];

export const reelNavItems = [
  { label: 'Esportes', href: '/esportes/', icon: '⚽' },
  { label: 'Cassino', href: '/cassino/', icon: '🍀' },
  { label: 'Cassino Ao Vivo', href: '/cassino-ao-vivo/', icon: '🃏' },
  { label: 'Promoções', href: '/promo/', icon: '🚀' },
  { label: 'Ao Vivo', href: '/esportes-ao-vivo/', icon: '📺' },
  { label: 'Bingo', href: '/bingo/', icon: '🎱' },
  { label: 'Crash Games', href: '/cassino/crash-games/', icon: '🎰' },
  { label: 'Guias', href: '/guias/', icon: '📖' },
  { label: 'Palpites', href: '/palpites/', icon: '💬' },
];

export const ctaSteps = [
  { number: '1', text: 'Crie uma conta KTO!' },
  { number: '2', text: 'Deposite usando o PIX!' },
  { number: '3', text: 'Aproveite Ganho Antecipado, Oddão e Cassino Cashback' },
];

export const footerColumns = [
  {
    title: 'Esportes',
    links: [
      { label: 'Apostas Online', href: '/esportes/' },
      { label: 'Ao Vivo Agora', href: '/esportes-ao-vivo/' },
      { label: 'Palpites', href: '/palpites/' },
      { label: 'Promoções', href: '/promocoes/' },
    ],
  },
  {
    title: 'Cassino',
    links: [
      { label: 'Jogue Cassino', href: '/cassino/' },
      { label: 'Slots', href: '/cassino/slots/' },
      { label: 'Crash Games', href: '/cassino/crash-games/' },
      { label: 'Promoções Casino', href: '/cassino/promocoes/' },
    ],
  },
  {
    title: 'Melhores Slots',
    links: [
      { label: 'Fortune Tiger', href: '/cassino/game/pgs_fortunetiger/' },
      { label: 'Sweet Bonanza', href: '/cassino/game/sweet-bonanza/' },
      { label: 'Sugar Rush', href: '/cassino/game/sugar-rush/' },
      { label: 'Gates of Olympus', href: '/cassino/game/gates-of-olympus/' },
    ],
  },
  {
    title: 'Sobre KTO',
    links: [
      { label: 'Sobre Nós', href: '/sobre/' },
      { label: 'T&C', href: '/termos/' },
      { label: 'Privacidade', href: '/privacidade/' },
      { label: 'Cookies', href: '/cookies/' },
    ],
  },
];
