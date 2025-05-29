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
import { LeadersDeployedThisPhaseWatcher } from './LeadersDeployedThisPhaseWatcher';
import { ForceUsedThisPhaseWatcher } from './ForceUsedThisPhaseWatcher';

export = {
    attacksThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new AttacksThisPhaseWatcher(registrar, card),
    cardsDiscardedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsDiscardedThisPhaseWatcher(registrar, card),
    cardsDrawnThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsDrawnThisPhaseWatcher(registrar, card),
    cardsEnteredPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsEnteredPlayThisPhaseWatcher(registrar, card),
    cardsLeftPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsLeftPlayThisPhaseWatcher(registrar, card),
    cardsPlayedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsPlayedThisPhaseWatcher(registrar, card),
    damageDealtThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new DamageDealtThisPhaseWatcher(registrar, card),
    forceUsedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new ForceUsedThisPhaseWatcher(registrar, card),
    leadersDeployedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new LeadersDeployedThisPhaseWatcher(registrar, card),
    unitsDefeatedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new UnitsDefeatedThisPhaseWatcher(registrar, card),
    unitsHealedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new UnitsHealedThisPhaseWatcher(registrar, card),
};
