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
import type Game from '../core/Game';


export class StateWatcherLibrary {
    private readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    public attacksThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new AttacksThisPhaseWatcher(this.game, registrar, card);
    }

    public cardsDiscardedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new CardsDiscardedThisPhaseWatcher(this.game, registrar, card);
    }

    public cardsDrawnThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new CardsDrawnThisPhaseWatcher(this.game, registrar, card);
    }

    public cardsEnteredPlayThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new CardsEnteredPlayThisPhaseWatcher(this.game, registrar, card);
    }

    public cardsLeftPlayThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new CardsLeftPlayThisPhaseWatcher(this.game, registrar, card);
    }

    public cardsPlayedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new CardsPlayedThisPhaseWatcher(this.game, registrar, card);
    }

    public damageDealtThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new DamageDealtThisPhaseWatcher(this.game, registrar, card);
    }

    public forceUsedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new ForceUsedThisPhaseWatcher(this.game, registrar, card);
    }

    public leadersDeployedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new LeadersDeployedThisPhaseWatcher(this.game, registrar, card);
    }

    public unitsDefeatedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new UnitsDefeatedThisPhaseWatcher(this.game, registrar, card);
    }

    public unitsHealedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return new UnitsHealedThisPhaseWatcher(this.game, registrar, card);
    }
}