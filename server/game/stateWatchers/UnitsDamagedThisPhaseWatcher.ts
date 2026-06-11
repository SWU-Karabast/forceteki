import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { Game } from '../core/Game';
import type { UnwrapRefObject } from '../core/GameObjectBase';

import { registerState, type GameObjectId } from '../core/GameObjectUtils';

export interface DamagedUnitEntry {
    unit: GameObjectId<IUnitCard>;
    inPlayId: number;
    controlledBy: GameObjectId<Player>;
}

export type IUnitsDamagedThisPhase = DamagedUnitEntry[];

@registerState()
export class UnitsDamagedThisPhaseWatcher extends StateWatcher<DamagedUnitEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.UnitsDamagedThisPhase, registrar);
    }

    /**
     * Returns an array of {@link DamagedUnitEntry} objects representing every unit defeated
     * this phase so far, as well as the controlling and defeating player.
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    protected override mapCurrentValue(stateValue: DamagedUnitEntry[]): UnwrapRefObject<DamagedUnitEntry>[] {
        return stateValue.map((x) => ({ inPlayId: x.inPlayId, unit: this.game.getFromId(x.unit), controlledBy: this.game.getFromId(x.controlledBy) }));
    }

    /** Check if a specific copy of a unit was healed this phase */
    public wasDamagedThisPhase(card: IUnitCard, inPlayId?: number): boolean {
        const inPlayIdToCheck = inPlayId ?? (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);

        return this.getCurrentValue().some(
            (entry) => entry.unit === card && entry.inPlayId === inPlayIdToCheck
        );
    }

    protected override setupWatcher() {
        // on damage healed, add the card to the player's list of cards healed this phase
        this.addUpdater({
            when: {
                onDamageDealt: (context) => context.card.isUnit(),
            },
            update: (currentState: IUnitsDamagedThisPhase, event: any) =>
                currentState.concat({ unit: event.card.getObjectId(), inPlayId: event.card.inPlayId, controlledBy: event.card.controller.getObjectId() })
        });
    }

    protected override getResetValue(): IUnitsDamagedThisPhase {
        return [];
    }
}
