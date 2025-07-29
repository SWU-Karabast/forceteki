import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Card } from '../core/card/Card';
import type { Player } from '../core/Player';
import type Game from '../core/Game';
import type { GameObjectRef } from '../core/GameObjectBase';

export interface ForceUsedEntry {
    player: GameObjectRef<Player>;
}

export type IForceUsedThisPhase = ForceUsedEntry[];

export class ForceUsedThisPhaseWatcher extends StateWatcher<IForceUsedThisPhase> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.ForceUsedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link ForceUsedEntry} objects representing every instance of Force usage
     * in this phase so far
     */
    public override getCurrentValue(): IForceUsedThisPhase {
        return super.getCurrentValue();
    }

    public countForceUsedThisPhase(player: Player): number {
        return this.getCurrentValue().filter((entry) => this.game.getFromRef(entry.player) === player).length;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onForceUsed: () => true,
            },
            update: (currentState: IForceUsedThisPhase, event: any) =>
                currentState.concat({
                    player: event.player,
                })
        });
    }

    protected override getResetValue(): IForceUsedThisPhase {
        return [];
    }
}
