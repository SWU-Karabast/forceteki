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
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { ActionsThisPhaseWatcher } from './ActionsThisPhaseWatcher';


export class StateWatcherLibrary {
    private readonly game: Game;

    public constructor(game: Game) {
        this.game = game;
    }

    // ////////////////////////////////////////////////////////////////////////////////////////////
    // ///// WARNING: every non-constructor method in this class is called during test setup
    // ///// by GameStateBuilder, If we add any methods here that are _not_ intended for
    // ///// registering a watcher, we need to update that code.
    // ////////////////////////////////////////////////////////////////////////////////////////////

    // CLEANUP TASK: Remove card from the function call and then all of the implementations that use these.
    public attacksThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.AttacksThisPhase,
            (registrar: StateWatcherRegistrar) => new AttacksThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public actionsThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.ActionsThisPhase,
            (registrar: StateWatcherRegistrar) => new ActionsThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public cardsDiscardedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.CardsDiscardedThisPhase,
            (registrar: StateWatcherRegistrar) => new CardsDiscardedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public cardsDrawnThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.CardsDrawnThisPhase,
            (registrar: StateWatcherRegistrar) => new CardsDrawnThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public cardsEnteredPlayThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.CardsEnteredPlayThisPhase,
            (registrar: StateWatcherRegistrar) => new CardsEnteredPlayThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public cardsLeftPlayThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.CardsLeftPlayThisPhase,
            (registrar: StateWatcherRegistrar) => new CardsLeftPlayThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public cardsPlayedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.CardsPlayedThisPhase,
            (registrar: StateWatcherRegistrar) => new CardsPlayedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public damageDealtThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.DamageDealtThisPhase,
            (registrar: StateWatcherRegistrar) => new DamageDealtThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public forceUsedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.ForceUsedThisPhase,
            (registrar: StateWatcherRegistrar) => new ForceUsedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public leadersDeployedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.LeadersDeployedThisPhase,
            (registrar: StateWatcherRegistrar) => new LeadersDeployedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public unitsDefeatedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.UnitsDefeatedThisPhase,
            (registrar: StateWatcherRegistrar) => new UnitsDefeatedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }

    public unitsHealedThisPhase() {
        return this.game.stateWatcherRegistrar.registerWatcher(
            StateWatcherName.UnitsHealedThisPhase,
            (registrar: StateWatcherRegistrar) => new UnitsHealedThisPhaseWatcher(this.game, registrar).initialize()
        );
    }
}