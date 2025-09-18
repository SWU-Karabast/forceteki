import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType, DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type Game from '../core/Game';
import type { GameObjectRef, UnwrapRef } from '../core/GameObjectBase';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../core/card/Card';
import * as EnumHelpers from '../core/utils/EnumHelpers';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';

export interface DamageDealtEntry {
    damageType: DamageType;
    damageSourceCard: GameObjectRef<IPlayableCard>;
    damageSourceInPlayId?: number;
    damageSourceCardType: CardType;
    damageSourcePlayer: GameObjectRef<Player>;
    damageSourceEventId: number;
    targets: GameObjectRef<Card>[];
    targetType: CardType;
    targetController: GameObjectRef<Player>;
    amount: number;
    isIndirect: boolean;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

export class DamageDealtThisPhaseWatcher extends StateWatcher<DamageDealtEntry> {
    public constructor (
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.DamageDealtThisPhase, registrar);
    }

    protected override mapCurrentValue (stateValue: DamageDealtEntry[]): UnwrapRef<DamageDealtEntry[]> {
        return stateValue.map((x) => ({
            ...x,
            damageSourceCard: this.game.getFromRef(x.damageSourceCard),
            targets: x.targets.map((y) => this.game.getFromRef(y)),
            targetController: this.game.getFromRef(x.targetController),
            damageSourcePlayer: this.game.getFromRef(x.damageSourcePlayer)
        }));
    }

    public getDamageDealtByPlayer (player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): UnwrapRef<IDamageDealtThisPhase> {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSourcePlayer === player && filter(entry));
    }

    public playerHasDealtDamage (player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getDamageDealtByPlayer(player, filter).length > 0;
    }

    public cardHasDealtDamage (card: Card, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getCurrentValue()
            .filter((entry) => {
                return entry.damageSourceCard === card && filter(entry);
            }).length > 0;
    }

    public unitHasDealtDamage (card: Card, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getCurrentValue().filter((entry) => EnumHelpers.isUnit(entry.damageSourceCardType))
            .filter((entry) => {
                return entry.damageSourceCard === card &&
                  card.canBeInPlay() &&
                  entry.damageSourceInPlayId === this.getCardId(card) &&
                  filter(entry);
            }).length > 0;
    }

    protected override setupWatcher () {
        this.addUpdater({
            when: {
                onDamageDealt: () => true,
            },
            update: (currentState: IDamageDealtThisPhase, event: any) => {
                let damageSourceCard: GameObjectRef<IPlayableCard> = undefined;
                let damageSourceCardType: CardType = undefined;
                let damageSourceInPlayId: number = undefined;
                let targets: GameObjectRef<Card>[] = [];

                if (event.type === 'combat') {
                    damageSourceCard = event.damageSource.attack?.attacker.getRef();
                    damageSourceInPlayId = this.getCardId(event.damageSource.attack?.attacker);
                    damageSourceCardType = event.damageSource.attack?.attacker.type;
                    targets = event.damageSource.attack?.getAllTargets().map((x) => x.getRef());
                } else if (event.type === 'overwhelm') {
                    damageSourceCard = event.damageSource.attack?.attacker.getRef();
                    damageSourceCardType = event.damageSource.attack?.attacker.type;
                    damageSourceInPlayId = this.getCardId(event.damageSource.attack?.attacker);
                    targets = [event.card.getRef()];
                } else if (event.type === 'ability') {
                    damageSourceCard = event.damageSource.card.getRef();
                    damageSourceCardType = event.damageSource.card.type;
                    damageSourceInPlayId = event.damageSource.card.canBeInPlay() ? this.getCardId(event.damageSource.card) : null;
                    targets = [event.card.getRef()];
                }

                return currentState.concat({
                    damageType: event.type,
                    damageSourceCard: damageSourceCard,
                    damageSourceInPlayId: damageSourceInPlayId,
                    damageSourceCardType: damageSourceCardType,
                    targets: targets,
                    damageSourcePlayer: event.damageSource.player?.getRef(),
                    damageSourceEventId: event.damageSource.eventId,
                    targetType: event.card.type,
                    targetController: event.card.controller?.getRef(),
                    amount: event.damageDealt,
                    isIndirect: event.isIndirect,
                });
            }
        });
    }

    private getCardId(card: IInPlayCard) {
        return (card.isInPlay() ? card.inPlayId : card.mostRecentInPlayId);
    }

    protected override getResetValue (): IDamageDealtThisPhase {
        return [];
    }
}
