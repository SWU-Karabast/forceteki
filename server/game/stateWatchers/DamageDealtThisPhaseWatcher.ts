import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType, DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { IDamageSource } from '../IDamageOrDefeatSource';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type Game from '../core/Game';
import type { UnwrapRef } from '../core/GameObjectBase';

// STATE TODO: This is a bad one. IDamageSource can have a lot of GameObjects and other nested references.
export interface DamageDealtEntry {
    damageType: DamageType;
    damageSource: IDamageSource;
    targetType: CardType;
    targetController: Player;
    amount: number;
    isIndirect: boolean;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

export class DamageDealtThisPhaseWatcher extends StateWatcher<IDamageDealtThisPhase> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(game, StateWatcherName.DamageDealtThisPhase, registrar, card);
    }

    protected override mapCurrentValue(stateValue: DamageDealtEntry[]): UnwrapRef<DamageDealtEntry[]> {
        return stateValue.map((x) => ({ ...x }));
    }

    public getDamageDealtByPlayer(player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): UnwrapRef<IDamageDealtThisPhase> {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSource.player === player && filter(entry));
    }

    public playerHasDealtDamage(player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getDamageDealtByPlayer(player, filter).length > 0;
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onDamageDealt: () => true,
            },
            update: (currentState: IDamageDealtThisPhase, event: any) =>
                currentState.concat({
                    damageType: event.type,
                    damageSource: event.damageSource,
                    targetType: event.card.type,
                    targetController: event.card.controller,
                    amount: event.damageDealt,
                    isIndirect: event.isIndirect,
                })
        });
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
