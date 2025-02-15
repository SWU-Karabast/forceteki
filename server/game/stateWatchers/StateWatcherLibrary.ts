import type { Card } from '../core/card/Card';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { AttacksThisPhaseWatcher } from './AttacksThisPhaseWatcher';
import { CardsLeftPlayThisPhaseWatcher } from './CardsLeftPlayThisPhaseWatcher';
import { CardsPlayedThisPhaseWatcher } from './CardsPlayedThisPhaseWatcher';
import { UnitsDefeatedThisPhaseWatcher } from './UnitsDefeatedThisPhaseWatcher';
import { CardsEnteredPlayThisPhaseWatcher } from './CardsEnteredPlayThisPhaseWatcher';
import { DamageDealtThisPhaseWatcher } from './DamageDealtThisPhaseWatcher';
import { CardsDrawnThisPhaseWatcher } from './CardsDrawnThisPhaseWatcher';
import { CardsDiscardedThisPhaseWatcher } from './CardsDiscardedThisPhaseWatcher';
import { UnitsHealedThisPhaseWatcher } from './UnitsHealedThisPhaseWatcher';

export = {
    attacksThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new AttacksThisPhaseWatcher(registrar, card),
    cardsDiscardedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsDiscardedThisPhaseWatcher(registrar, card),
    cardsDrawnThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsDrawnThisPhaseWatcher(registrar, card),
    cardsLeftPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsLeftPlayThisPhaseWatcher(registrar, card),
    cardsPlayedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsPlayedThisPhaseWatcher(registrar, card),
    unitsDefeatedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new UnitsDefeatedThisPhaseWatcher(registrar, card),
    cardsEnteredPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsEnteredPlayThisPhaseWatcher(registrar, card),
    damageDealtThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new DamageDealtThisPhaseWatcher(registrar, card),
    unitsHealedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new UnitsHealedThisPhaseWatcher(registrar, card),
};
