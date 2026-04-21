export interface Game {
  name: string;
  provider: string;
  providerUrl: string;
  gameUrl: string;
  imageUrl: string;
  badges?: string[];
}

export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
}

export interface SlideData {
  id: number;
  headline: string;
  subtitle: string;
  ctaText: string;
  ctaUrl: string;
  bgColor: string;
  textColor: string;
  mobileImage: string;
  desktopImage: string;
}

export interface USPItem {
  text: string;
}

export interface ReelNavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

export interface CTAStep {
  number: string;
  text: string;
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}
