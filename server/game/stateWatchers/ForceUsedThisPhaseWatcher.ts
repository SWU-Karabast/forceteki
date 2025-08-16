import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Card } from '../core/card/Card';
import type { Player } from '../core/Player';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface ForceUsedEntry {
    player: GameObjectRef<Player>;
}

export class ForceUsedThisPhaseWatcher extends StateWatcher<ForceUsedEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.ForceUsedThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: ForceUsedEntry[]): UnwrapRef<ForceUsedEntry[]> {
        return stateValue.map((x) => ({ player: this.game.getFromRef(x.player) }));
    }

    /**
     * Returns an array of {@link ForceUsedEntry} objects representing every instance of Force usage
     * in this phase so far
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    public countForceUsedThisPhase(player: Player): number {
        return this.getCurrentValue().filter((entry) => entry.player === player).length;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onForceUsed: () => true,
            },
            update: (currentState: ForceUsedEntry[], event: any) =>
                currentState.concat({
                    player: event.player.getRef(),
                })
        });
    }

    protected override getResetValue(): ForceUsedEntry[] {
        return [];
    }
}
