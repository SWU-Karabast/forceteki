import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import { StateWatcherName } from '../core/Constants';
import type { Game } from '../core/Game';
import type { UnwrapRef } from '../core/GameObjectBase';
import { registerState, type GameObjectId } from '../core/GameObjectUtils';
import type { Player } from '../core/Player';
import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';

export interface CreatedTokenEntry {
    token: GameObjectId<IInPlayCard>;
    createdBy: GameObjectId<Player>;
}

@registerState()
export class TokensCreatedThisPhaseWatcher extends StateWatcher<CreatedTokenEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.TokensCreatedThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: CreatedTokenEntry[]): UnwrapRef<CreatedTokenEntry>[] {
        return stateValue.map((x) => ({
            token: this.game.getFromId(x.token),
            createdBy: this.game.getFromId(x.createdBy)
        }));
    }

    /** Filters the list of created tokens in the state and returns the tokens that match */
    public getTokensCreated(filter: (entry: UnwrapRef<CreatedTokenEntry>) => boolean): IInPlayCard[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.token);
    }

    /** Check the list of created tokens in the state if we found tokens that match filters */
    public someTokenCreated(filter: (entry: UnwrapRef<CreatedTokenEntry>) => boolean): boolean {
        return this.getTokensCreated(filter).length > 0;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onTokensCreated: () => true,
            },
            update: (currentState: CreatedTokenEntry[], event: any) => {
                return !event.generatedTokens ? currentState : currentState.concat(
                    event.generatedTokens.map((token) => ({
                        token: token.getObjectId(),
                        createdBy: event.player.getObjectId(),
                    }))
                );
            }
        });
    }

    protected override getResetValue(): CreatedTokenEntry[] {
        return [];
    }
}
