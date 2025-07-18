import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { IAttackableCard } from '../core/card/CardInterfaces';

export interface AttackEntry {
    attacker: IUnitCard;
    attackerInPlayId: number;
    attackingPlayer: Player;
    targets: IAttackableCard[];
    targetInPlayId?: number;
    defendingPlayer: Player;
}

export type IAttacksThisPhase = AttackEntry[];

export class AttacksThisPhaseWatcher extends StateWatcher<IAttacksThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.AttacksThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link AttackEntry} objects representing every attack this
     * phase so far. Lists the attacker and target cards and which player was attacking
     * or defending.
     */
    public override getCurrentValue(): IAttacksThisPhase {
        return super.getCurrentValue();
    }

    /** Filters the list of attack events in the state and returns the attackers that match */
    public getAttackers(filter: (entry: AttackEntry) => boolean): Card[] {
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
    public getAttackersInPlay(filter: (entry: AttackEntry) => boolean): Card[] {
        return this.getCurrentValue()
            .filter((entry) => entry.attacker.isInPlay() && entry.attacker.inPlayId === entry.attackerInPlayId)
            .filter(filter)
            .map((entry) => entry.attacker);
    }

    public someUnitAttackedControlledByPlayer({ controller, filter }: {
        controller: Player;
        filter?: (event: AttackEntry) => boolean;
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
            update: (currentState: IAttacksThisPhase, event: any) =>
                currentState.concat({
                    attacker: event.attack.attacker,
                    attackerInPlayId: event.attack.attacker.inPlayId,
                    attackingPlayer: event.attack.attacker.controller,
                    targets: event.attack.getAllTargets(),
                    targetInPlayId: event.attack.targetInPlayId,
                    defendingPlayer: event.attack.getDefendingPlayer(),
                })
        });
    }

    protected override getResetValue(): IAttacksThisPhase {
        return [];
    }
}
