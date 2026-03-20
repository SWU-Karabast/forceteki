import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { IAttackableCard } from '../core/card/CardInterfaces';
import type { Game } from '../core/Game';
import type { UnwrapRef } from '../core/GameObjectBase';
import type { ICardAttributes } from '../Interfaces';

import { registerState, type GameObjectId } from '../core/GameObjectUtils';

export interface AttackEntry {
    attacker: GameObjectId<IUnitCard>;
    attackerInPlayId: number;
    attackerAttributes: ICardAttributes;
    attackingPlayer: GameObjectId<Player>;
    targets: GameObjectId<IAttackableCard>[];
    targetInPlayId?: number;
    defendingPlayer: GameObjectId<Player>;
    actionNumber: number;
    attackId: number;
}

@registerState()
export class AttacksThisPhaseWatcher extends StateWatcher<AttackEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.AttacksThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: AttackEntry[]): UnwrapRef<AttackEntry>[] {
        return stateValue.map((x) => ({
            ...x,
            attacker: this.game.getFromId(x.attacker),
            attackingPlayer: this.game.getFromId(x.attackingPlayer),
            targets: x.targets.map((y) => this.game.getFromId(y)),
            defendingPlayer: this.game.getFromId(x.defendingPlayer),
        }));
    }

    /**
     * Returns an array of {@link AttackEntry} objects representing every attack this
     * phase so far. Lists the attacker and target cards and which player was attacking
     * or defending.
     */
    public override getCurrentValue() {
        return super.getCurrentValue();
    }

    /** Filters the list of attack events in the state and returns the attackers that match */
    public getAttackers(filter: (entry: UnwrapRef<AttackEntry>) => boolean): Card[] {
        return this.getCurrentValue()
            .filter(filter)
            .map((entry) => entry.attacker);
    }

    public cardDidAttack(card: Card): boolean {
        return this.getAttackersInPlay((entry) => entry.attacker === card).length > 0;
    }

    /**
     * Filters the list of attack events in the state and returns the attackers that match.
     * Selects only units that are currently in play as the same copy (in-play id) that performed the attack.
     */
    public getAttackersInPlay(filter: (entry: UnwrapRef<AttackEntry>) => boolean): Card[] {
        return this.getCurrentValue()
            .filter((entry) => entry.attacker.isInPlay() && entry.attacker.inPlayId === entry.attackerInPlayId)
            .filter(filter)
            .map((entry) => entry.attacker);
    }

    public someUnitAttackedControlledByPlayer({ controller, filter }: {
        controller: Player;
        filter?: (event: UnwrapRef<AttackEntry>) => boolean;
    }) {
        return this.getAttackers((entry) => {
            const additionalFilter = filter ? filter(entry) : true;

            return entry.attackingPlayer === controller && additionalFilter;
        }).length > 0;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onAttackDeclared: () => true,
            },
            update: (currentState: AttackEntry[], event: any) =>
                currentState.concat({
                    attacker: event.attack.attacker.getObjectId(),
                    attackerInPlayId: event.attack.attacker.inPlayId,
                    attackerAttributes: event.attack.attacker.attributes,
                    attackingPlayer: event.attack.attacker.controller.getObjectId(),
                    targets: event.attack.getAllTargets().map((x) => x.getObjectId()),
                    targetInPlayId: event.attack.targetInPlayId,
                    defendingPlayer: event.attack.getDefendingPlayer().getObjectId(),
                    actionNumber: event.context.game.actionNumber,
                    attackId: event.attack.id,
                })
        });
    }

    protected override getResetValue(): AttackEntry[] {
        return [];
    }
}
