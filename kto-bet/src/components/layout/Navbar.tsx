'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Percent, HelpCircle, Users, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NavItem, QuickAction } from '@/types';

const NAV_ITEMS: NavItem[] = [
  { id: 'esportes', label: 'Esportes', href: '/esportes' },
  { id: 'ao-vivo', label: 'Ao Vivo', href: '/ao-vivo' },
  { id: 'cassino', label: 'Cassino', href: '/cassino' },
  { id: 'cassino-live', label: 'Cassino Ao Vivo', href: '/cassino-live' },
  { id: 'promocoes', label: 'Promoções', href: '/promocoes' },
];

const QUICK_ACTIONS: QuickAction[] = [
  { id: 'clube', label: 'Clube KTO', icon: <Trophy size={18} />, href: '/clube' },
  { id: 'cashback', label: 'Cashback', icon: <Percent size={18} />, href: '/cashback' },
  { id: 'amigo', label: 'Indique', icon: <Users size={18} />, href: '/indique' },
  { id: 'ajuda', label: 'Ajuda', icon: <HelpCircle size={18} />, href: '/ajuda' },
];

interface NavbarProps {
  activeTab?: string;
  isLoggedIn?: boolean;
  userName?: string;
  onLogin?: () => void;
  onRegister?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab = 'esportes',
  isLoggedIn = false,
  userName,
  onLogin,
  onRegister,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-[50px] bg-brand-surface-background border-b border-brand-surface-card shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 h-full flex items-center justify-between gap-4">
        
        {/* Logo */}
        <div className="flex items-center min-w-[120px]">
          <Link href="/" className="hover:opacity-90 transition-opacity" aria-label="KTO Bet Home">
            <div className="heading-branded text-brand-primary text-2xl">KTO BET</div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center justify-center flex-1 h-full">
          <ul className="flex items-center gap-1 h-full">
            {NAV_ITEMS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <li key={item.id} className="h-full flex items-center">
                  <Link
                    href={item.href || '#'}
                    className={cn(
                      "relative px-4 h-full flex items-center text-sm font-bold transition-colors duration-200",
                      isActive 
                        ? "text-brand-primary" 
                        : "text-gray-600 hover:text-brand-primary"
                    )}
                  >
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 w-full h-[3px] bg-brand-primary rounded-t-sm" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 md:gap-4 min-w-fit">
          
          {/* Quick Actions */}
          <div className="hidden md:flex items-center gap-1 border-r border-gray-200 pr-4 mr-2">
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href || '#'}
                className="group flex flex-col items-center justify-center w-12 h-10 rounded-md hover:bg-brand-surface-card transition-colors text-gray-500 hover:text-brand-primary"
                title={action.label}
              >
                <span className="mb-0.5 group-hover:scale-110 transition-transform">{action.icon}</span>
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-sm font-bold text-gray-700 mr-2">
                Olá, {userName}
              </span>
              <button 
                onClick={onLogout}
                className="btn-ghost px-4 py-1.5 text-sm font-bold text-gray-700"
              >
                Sair
              </button>
              <button className="btn-secondary px-4 py-1.5 text-sm font-bold">
                Minha Conta
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button 
                onClick={onLogin}
                className="btn-ghost hidden sm:inline-flex"
              >
                Entrar
              </button>
              <button 
                onClick={onRegister}
                className="btn-secondary"
              >
                Registrar
              </button>
            </div>
          )}

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-gray-600 hover:text-brand-primary"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[50px] left-0 w-full bg-brand-surface-background border-b border-brand-surface-card shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col p-4 gap-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.href || '#'}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-md font-bold text-base flex items-center justify-between",
                  activeTab === item.id 
                    ? "bg-red-50 text-brand-primary border-l-4 border-brand-primary" 
                    : "text-gray-700 hover:bg-brand-surface-card"
                )}
              >
                {item.label}
                {activeTab === item.id && <span className="w-2 h-2 rounded-full bg-brand-primary" />}
              </Link>
            ))}
            
            <div className="h-px bg-gray-200 my-2" />
            
            {QUICK_ACTIONS.map((action) => (
              <Link
                key={action.id}
                href={action.href || '#'}
                className="w-full text-left px-4 py-3 rounded-md font-medium text-gray-600 hover:bg-brand-surface-card flex items-center gap-3"
              >
                {action.icon}
                {action.label}
              </Link>
            ))}

            {!isLoggedIn && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button onClick={onLogin} className="btn-ghost w-full py-3">Entrar</button>
                <button onClick={onRegister} className="btn-secondary w-full py-3">Registrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
