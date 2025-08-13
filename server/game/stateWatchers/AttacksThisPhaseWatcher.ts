import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { IAttackableCard } from '../core/card/CardInterfaces';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface AttackEntry {
    attacker: GameObjectRef<IUnitCard>;
    attackerInPlayId: number;
    attackingPlayer: GameObjectRef<Player>;
    targets: GameObjectRef<IAttackableCard>[];
    targetInPlayId?: number;
    defendingPlayer: GameObjectRef<Player>;
}

export type IAttacksThisPhase = AttackEntry[];

export class AttacksThisPhaseWatcher extends StateWatcher<IAttacksThisPhase> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.AttacksThisPhase, registrar, card);
    }

    protected override mapCurrentValue(stateValue: IAttacksThisPhase): UnwrapRef<IAttacksThisPhase> {
        return stateValue.map((x) => ({ attacker: this.game.getFromRef(x.attacker), attackerInPlayId: x.attackerInPlayId, attackingPlayer: this.game.getFromRef(x.attackingPlayer), targets: x.targets.map((y) => this.game.getFromRef(y)), targetInPlayId: x.targetInPlayId, defendingPlayer: this.game.getFromRef(x.defendingPlayer) }));
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
            update: (currentState: IAttacksThisPhase, event: any) =>
                currentState.concat({
                    attacker: event.attack.attacker.getRef(),
                    attackerInPlayId: event.attack.attacker.inPlayId,
                    attackingPlayer: event.attack.attacker.controller.getRef(),
                    targets: event.attack.getAllTargets().map((x) => x.getRef()),
                    targetInPlayId: event.attack.targetInPlayId,
                    defendingPlayer: event.attack.getDefendingPlayer().getRef(),
                })
        });
    }

    protected override getResetValue(): IAttacksThisPhase {
        return [];
    }
}
