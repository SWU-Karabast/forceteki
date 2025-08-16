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
import { StateWatcherName } from '../core/Constants';


export class StateWatcherLibrary {
    private readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    // CLEANUP TASK: Remove card from the function call and then all of the cards that use these.
    public attacksThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.AttacksThisPhase, () => new AttacksThisPhaseWatcher(this.game, registrar));
    }

    public cardsDiscardedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.CardsDiscardedThisPhase, () => new CardsDiscardedThisPhaseWatcher(this.game, registrar));
    }

    public cardsDrawnThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.CardsDrawnThisPhase, () => new CardsDrawnThisPhaseWatcher(this.game, registrar));
    }

    public cardsEnteredPlayThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.CardsEnteredPlayThisPhase, () => new CardsEnteredPlayThisPhaseWatcher(this.game, registrar));
    }

    public cardsLeftPlayThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.CardsLeftPlayThisPhase, () => new CardsLeftPlayThisPhaseWatcher(this.game, registrar));
    }

    public cardsPlayedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.CardsPlayedThisPhase, () => new CardsPlayedThisPhaseWatcher(this.game, registrar));
    }

    public damageDealtThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.DamageDealtThisPhase, () => new DamageDealtThisPhaseWatcher(this.game, registrar));
    }

    public forceUsedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.ForceUsedThisPhase, () => new ForceUsedThisPhaseWatcher(this.game, registrar));
    }

    public leadersDeployedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.LeadersDeployedThisPhase, () => new LeadersDeployedThisPhaseWatcher(this.game, registrar));
    }

    public unitsDefeatedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.UnitsDefeatedThisPhase, () => new UnitsDefeatedThisPhaseWatcher(this.game, registrar));
    }

    public unitsHealedThisPhase(registrar: StateWatcherRegistrar, card: Card) {
        return registrar.registerWatcher(StateWatcherName.UnitsHealedThisPhase, () => new UnitsHealedThisPhaseWatcher(this.game, registrar));
    }
}