import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { IDamageSource } from '../IDamageOrDefeatSource';
import type { Player } from '../core/Player';
import type { Card } from '../core/card/Card';
import type Game from '../core/Game';
import type { GameObjectRef } from '../core/GameObjectBase';

// STATE TODO: This is a bad one. IDamageSource can have a lot of GameObjects and other nested references.
export interface DamageDealtEntry {
    damageType: DamageType;
    damageSource: IDamageSource;
    target: GameObjectRef<Card>;
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

    public getDamageDealtByPlayer(player: Player, filter: (entry: DamageDealtEntry) => boolean = () => true): IDamageDealtThisPhase {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSource.player === player && filter(entry));
    }

    public playerHasDealtDamage(player: Player, filter: (entry: DamageDealtEntry) => boolean = () => true): boolean {
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
                    target: event.card,
                    amount: event.damageDealt,
                    isIndirect: event.isIndirect,
                })
        });
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
