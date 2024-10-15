import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import Player from '../core/Player';
import { UnitCard } from '../core/card/CardTypes';
import { Card } from '../core/card/Card';
import { BaseCard } from '../core/card/BaseCard';

export interface AttackEntry {
    attacker: UnitCard;
    attackingPlayer: Player;
    target: UnitCard | BaseCard;
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

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onAttackDeclared: () => true,
            },
            update: (currentState: IAttacksThisPhase, event: any) =>
                currentState.concat({
                    attacker: event.attack.attacker,
                    attackingPlayer: event.attack.attacker.controller,
                    target: event.attack.target,
                    defendingPlayer: event.attack.target.controller
                })
        });
    }

    protected override getResetValue(): IAttacksThisPhase {
        return [];
    }
}
