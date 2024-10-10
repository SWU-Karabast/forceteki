import { Card } from '../core/card/Card';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { AttacksThisPhaseWatcher } from './AttacksThisPhaseWatcher';
import { CardsLeftPlayThisPhaseWatcher } from './CardsLeftPlayThisPhaseWatcher';
import { CardsPlayedThisPhaseWatcher } from './CardsPlayedThisPhaseWatcher';
import { UnitsDefeatedThisPhaseWatcher } from './UnitsDefeatedThisPhaseWatcher';
import { CardsEnteredPlayThisPhaseWatcher } from './CardsEnteredPlayThisPhaseWatcher';

export = {
    attacksThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new AttacksThisPhaseWatcher(registrar, card),
    cardsLeftPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsLeftPlayThisPhaseWatcher(registrar, card),
    cardsPlayedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsPlayedThisPhaseWatcher(registrar, card),
    unitsDefeatedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new UnitsDefeatedThisPhaseWatcher(registrar, card),
    cardsEnteredPlayThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsEnteredPlayThisPhaseWatcher(registrar, card)
};
