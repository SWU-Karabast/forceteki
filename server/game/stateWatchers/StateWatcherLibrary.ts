import { Card } from '../core/card/Card';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { AttacksThisPhaseWatcher } from './AttacksThisPhaseWatcher';
import { CardsPlayedThisPhaseWatcher } from './CardsPlayedThisPhaseWatcher';

export = {
    attacksThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new AttacksThisPhaseWatcher(registrar, card),
    cardsPlayedThisPhase: (registrar: StateWatcherRegistrar, card: Card) => new CardsPlayedThisPhaseWatcher(registrar, card)
};