import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Game } from '../core/Game';
import type { UnwrapRefObject } from '../core/GameObjectBase';
import { registerState, type GameObjectId } from '../core/GameObjectUtils';
import type { IBaseCard } from '../core/card/BaseCard';

export interface HealedBaseEntry {
    base: GameObjectId<IBaseCard>;
}

export type IBasesHealedThisPhase = HealedBaseEntry[];

@registerState()
export class BasesHealedThisPhaseWatcher extends StateWatcher<HealedBaseEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.BasesHealedThisPhase, registrar);
    }

    /**
     * Returns an array of {@link HealedBaseEntry} objects representing every base healed
     * this phase so far, as well as the controlling player.
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    protected override mapCurrentValue(stateValue: HealedBaseEntry[]): UnwrapRefObject<HealedBaseEntry>[] {
        return stateValue.map((x) => ({ base: this.game.getFromId(x.base) }));
    }

    /** Check if a specific base was healed this phase */
    public wasHealedThisPhase(card: IBaseCard): boolean {
        return this.getCurrentValue().some(
            (entry) => entry.base === card
        );
    }

    protected override setupWatcher() {
        // on damage healed, add the base to the player's list of bases healed this phase
        this.addUpdater({
            when: {
                onDamageHealed: (context) => context.card.isBase(),
            },
            update: (currentState: IBasesHealedThisPhase, event: any) =>
                currentState.concat({ base: event.card.getObjectId() })
        });
    }

    protected override getResetValue(): IBasesHealedThisPhase {
        return [];
    }
}
