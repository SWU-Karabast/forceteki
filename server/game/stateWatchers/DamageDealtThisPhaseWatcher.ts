import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import { StateWatcherName, DamageType } from '../core/Constants';
import { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import { IDamageSource } from '../IDamageOrDefeatSource';
import Player from '../core/Player';
import { Card } from '../core/card/Card';

export interface DamageDealtEntry {
    damageType: DamageType;
    damageSource: IDamageSource;
    target: Card;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

export class DamageDealtThisPhaseWatcher extends StateWatcher<IDamageDealtThisPhase> {
    public constructor(
        registrar: StateWatcherRegistrar,
        card: Card
    ) {
        super(StateWatcherName.DamageDealtThisPhase, registrar, card);
    }

    public getOpponentsWhoseBasesWereDamagedByPlayer(player: Player) {
        return [
            ...new Set(
                this.getCurrentValue()
                    .filter((entry) => entry.target.isBase() && entry.damageSource.player === player)
                    .map((entry) => entry.target.controller)
            )
        ].filter((opponent) => opponent !== player);
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
                    target: event.card
                })
        });
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
