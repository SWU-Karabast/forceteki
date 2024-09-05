import { StateWatcher } from './StateWatcher';
import { StateWatcherName } from '../Constants';
import { StateWatcherRegistrar } from './StateWatcherRegistrar';
import Player from '../Player';
import { UnitCard } from '../card/CardTypes';
import { Card } from '../card/Card';
import { BaseCard } from '../card/BaseCard';

export interface AttackEntry {
    attacker: UnitCard,
    attackingPlayer: Player,
    target: UnitCard | BaseCard,
    defendingPlayer: Player
}

export type IAttacksThisPhase = AttackEntry[];

export class AttacksThisPhaseWatcher extends StateWatcher<IAttacksThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.UnitsAttackedThisPhase, registrar, card);
    }

    /**
     * Returns an array of {@link AttackEntry} objects representing every attack this
     * phase so far. Lists the attacker and target cards and which player was attacking
     * or defending.
     */
    public override getCurrentValue(): IAttacksThisPhase {
        return super.getCurrentValue();
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
