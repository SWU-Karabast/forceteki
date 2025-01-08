import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { IDamageSource } from '../IDamageOrDefeatSource';
import type Player from '../core/Player';
import type { Card } from '../core/card/Card';

export interface DamageDealtEntry {
    damageType: DamageType;
    damageSource: IDamageSource;
    target: Card;
    amount: number;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

export class DamageDealtThisPhaseWatcher extends StateWatcher<IDamageDealtThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.DamageDealtThisPhase, registrar, card);
    }

    public getDamageDealtByPlayer(player: Player, filter: (entry: DamageDealtEntry) => boolean = () => true): IDamageDealtThisPhase {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSource.player === player && filter(entry));
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
                    amount: event.amount
                })
        });
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
