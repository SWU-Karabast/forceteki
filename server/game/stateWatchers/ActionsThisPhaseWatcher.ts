import { StateWatcherName } from '../core/Constants';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';
import type { Player } from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';

import { registerState } from '../core/GameObjectUtils';

export interface ActionEntry {
    actionNumber: number;
    player: GameObjectRef<Player>;
}

@registerState()
export class ActionsThisPhaseWatcher extends StateWatcher<ActionEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar
    ) {
        super(game, StateWatcherName.ActionsThisPhase, registrar);
    }

    public getActions(filter: (entry: UnwrapRef<ActionEntry>) => boolean): UnwrapRef<ActionEntry>[] {
        return this.getCurrentValue()
            .filter(filter);
    }

    public playerHasTakenAction(player: Player): boolean {
        return this.getActions((entry) => entry.player === player).length > 0;
    }

    public previousActionNumberForPlayer(player: Player): number | null {
        const actions = this.getActions((entry) => entry.player === player);
        if (actions.length === 0) {
            return null;
        }

        return actions[actions.length - 1].actionNumber;
    }

    protected override mapCurrentValue(stateValue: ActionEntry[]): UnwrapRef<ActionEntry>[] {
        return stateValue.map((x) => ({
            player: this.game.getFromRef(x.player),
            actionNumber: x.actionNumber
        }));
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onActionTaken: () => true,
            },
            update: (currentState: ActionEntry[], event) =>
                currentState.concat({
                    player: event.player.getRef(),
                    actionNumber: event.actionNumber
                })
        });
    }

    protected override getResetValue(): ActionEntry[] {
        return [];
    }
}