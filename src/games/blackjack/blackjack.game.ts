import { BaseGame } from '../base-game';
import { GameRoundResult } from '../types';

/**
 * Configuração do jogo Blackjack
 */
const BLACKJACK_CONFIG = {
  name: 'Blackjack',
  type: 'blackjack',
  minBet: 1.0,
  maxBet: 1000,
  rtp: 0.995, // Blackjack tem RTP mais alto
  dealerStandOn: 17,
  blackjackPayout: 1.5, // 3:2
};

/**
 * Representa uma carta
 */
export interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

/**
 * Implementação do jogo Blackjack
 */
export class BlackjackGame extends BaseGame {
  private deck: Card[] = [];
  private dealerHand: Card[] = [];
  private playerHand: Card[] = [];

  constructor() {
    super(BLACKJACK_CONFIG);
  }

  /**
   * Inicia nova rodada de Blackjack
   */
  async play(betAmount: number, userId: string, seed?: string): Promise<GameRoundResult> {
    this.validateBetAmount(betAmount);

    const roundId = this.generateRoundId();
    
    // Inicializa e embaralha o deck
    this.initializeDeck(seed);
    this.shuffleDeck();

    // Deal inicial
    this.dealerHand = [this.drawCard(), this.drawCard()];
    this.playerHand = [this.drawCard(), this.drawCard()];

    // Player joga (hit until stand or bust - simplificado)
    const playerBusted = this.playerHits();

    // Dealer joga se player não bustou
    let dealerBusted = false;
    if (!playerBusted) {
      dealerBusted = this.dealerHits();
    }

    // Determina resultado
    const result = this.determineWinner(playerBusted, dealerBusted);
    const winAmount = this.calculateWinnings(betAmount, result);

    return {
      roundId,
      gameId: this.id,
      userId,
      betAmount,
      winAmount,
      multiplier: winAmount / betAmount,
      result: {
        playerHand: this.playerHand,
        dealerHand: this.dealerHand,
        playerValue: this.calculateHandValue(this.playerHand),
        dealerValue: this.calculateHandValue(this.dealerHand),
        outcome: result.outcome,
        playerBusted,
        dealerBusted,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Inicializa deck com 6 baralhos (padrão casino)
   */
  private initializeDeck(seed?: string): void {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    
    this.deck = [];
    
    // 6 baralhos
    for (let d = 0; d < 6; d++) {
      for (const suit of suits) {
        for (const value of values) {
          let numericValue = parseInt(value);
          if (['J', 'Q', 'K'].includes(value)) {
            numericValue = 10;
          } else if (value === 'A') {
            numericValue = 11; // Ás vale 11 ou 1
          }
          
          this.deck.push({ suit, value, numericValue });
        }
      }
    }
  }

  /**
   * Embaralha o deck (Fisher-Yates shuffle)
   */
  private shuffleDeck(): void {
    for (let i = this.deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
    }
  }

  /**
   * Compra uma carta do deck
   */
  private drawCard(): Card {
    if (this.deck.length === 0) {
      throw new Error('Deck vazio');
    }
    return this.deck.pop()!;
  }

  /**
   * Calcula valor da mão (considerando Ás como 1 ou 11)
   */
  private calculateHandValue(hand: Card[]): number {
    let value = hand.reduce((sum, card) => sum + card.numericValue, 0);
    let aces = hand.filter(card => card.value === 'A').length;

    // Ajusta ás de 11 para 1 se necessário
    while (value > 21 && aces > 0) {
      value -= 10;
      aces--;
    }

    return value;
  }

  /**
   * Player hit strategy (simplificada: hit até 17)
   */
  private playerHits(): boolean {
    while (this.calculateHandValue(this.playerHand) < 17) {
      this.playerHand.push(this.drawCard());
    }
    return this.calculateHandValue(this.playerHand) > 21;
  }

  /**
   * Dealer hit strategy (hit até 17)
   */
  private dealerHits(): boolean {
    while (this.calculateHandValue(this.dealerHand) < BLACKJACK_CONFIG.dealerStandOn) {
      this.dealerHand.push(this.drawCard());
    }
    return this.calculateHandValue(this.dealerHand) > 21;
  }

  /**
   * Determina vencedor da rodada
   */
  private determineWinner(playerBusted: boolean, dealerBusted: boolean): { outcome: string; isBlackjack: boolean } {
    const playerValue = this.calculateHandValue(this.playerHand);
    const dealerValue = this.calculateHandValue(this.dealerHand);
    
    const isBlackjack = this.playerHand.length === 2 && playerValue === 21;

    if (playerBusted) {
      return { outcome: 'lose', isBlackjack: false };
    }
    if (dealerBusted) {
      return { outcome: 'win', isBlackjack };
    }
    if (playerValue > dealerValue) {
      return { outcome: 'win', isBlackjack };
    }
    if (playerValue < dealerValue) {
      return { outcome: 'lose', isBlackjack: false };
    }
    return { outcome: 'push', isBlackjack: false }; // Empate
  }

  /**
   * Calcula winnings baseado no resultado
   */
  calculateWinnings(betAmount: number, result: { outcome: string; isBlackjack: boolean }): number {
    switch (result.outcome) {
      case 'win':
        return result.isBlackjack 
          ? betAmount * BLACKJACK_CONFIG.blackjackPayout 
          : betAmount;
      case 'push':
        return betAmount; // Devolve aposta
      default:
        return 0; // Perdeu
    }
  }

  /**
   * Retorna mãos atuais (para frontend)
   */
  getHands(): { player: Card[]; dealer: Card[] } {
    return {
      player: this.playerHand,
      dealer: this.dealerHand,
    };
  }
}
