import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType, DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';

export interface DamageDealtEntry {
    damageType: DamageType;
    damageSourcePlayer: GameObjectRef<Player>;
    damageSourceEventId: number;
    targetType: CardType;
    targetController: GameObjectRef<Player>;
    amount: number;
    isIndirect: boolean;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

export class DamageDealtThisPhaseWatcher extends StateWatcher<DamageDealtEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.DamageDealtThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: DamageDealtEntry[]): UnwrapRef<DamageDealtEntry[]> {
        return stateValue.map((x) => ({ ...x, targetController: this.game.getFromRef(x.targetController), damageSourcePlayer: this.game.getFromRef(x.damageSourcePlayer) }));
    }

    public getDamageDealtByPlayer(player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): UnwrapRef<IDamageDealtThisPhase> {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSourcePlayer === player && filter(entry));
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
                    damageSourcePlayer: event.damageSource.player?.getRef(),
                    damageSourceEventId: event.damageSource.eventId,
                    targetType: event.card.type,
                    targetController: event.card.controller?.getRef(),
                    amount: event.damageDealt,
                    isIndirect: event.isIndirect,
                })
        });
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
