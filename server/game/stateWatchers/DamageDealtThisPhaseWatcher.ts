import { StateWatcher } from '../core/stateWatcher/StateWatcher';
import type { CardType } from '../core/Constants';
import { DamageType } from '../core/Constants';
import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Player } from '../core/Player';
import type { Game } from '../core/Game';
import type { UnwrapRef } from '../core/GameObjectBase';
import type { IPlayableCard } from '../core/card/baseClasses/PlayableOrDeployableCard';
import type { Card } from '../core/card/Card';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import type { IInPlayCard } from '../core/card/baseClasses/InPlayCard';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { TriggeredAbilityContext } from '../core/ability/TriggeredAbilityContext';

import { registerState, type GameObjectId } from '../core/GameObjectUtils';

export interface DamageDealtEntry {
    damageType: DamageType;
    /** The cards that dealt this damage. Typically one card, but may be multiple for return combat damage (all defenders dealing damage to the attacker simultaneously). */
    damageSourceCards: GameObjectId<IPlayableCard>[];
    /** In-play IDs for each entry in damageSourceCards, aligned by index. */
    damageSourceInPlayIds: (number | undefined)[];
    /** Card types for each entry in damageSourceCards, aligned by index. */
    damageSourceCardTypes: CardType[];
    damageSourcePlayer: GameObjectId<Player>;
    damageSourceEventId: number;
    targets: GameObjectId<Card>[];
    targetType: CardType;
    targetController: GameObjectId<Player>;
    amount: number;
    isIndirect: boolean;
    activeAttackId?: number;
}

export type IDamageDealtThisPhase = DamageDealtEntry[];

@registerState()
export class DamageDealtThisPhaseWatcher extends StateWatcher<DamageDealtEntry> {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.DamageDealtThisPhase, registrar);
    }

    protected override mapCurrentValue(stateValue: DamageDealtEntry[]): UnwrapRef<DamageDealtEntry[]> {
        return stateValue.map((x) => ({
            ...x,
            damageSourceCards: x.damageSourceCards.map((c) => this.game.getFromId(c)),
            targets: x.targets.map((y) => this.game.getFromId(y)),
            targetController: this.game.getFromId(x.targetController),
            damageSourcePlayer: this.game.getFromId(x.damageSourcePlayer)
        })) as unknown as UnwrapRef<DamageDealtEntry[]>;
    }

    public getDamageDealtByPlayer(player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): UnwrapRef<IDamageDealtThisPhase> {
        return this.getCurrentValue()
            .filter((entry) => entry.damageSourcePlayer === player && filter(entry));
    }

    public playerHasDealtDamage(player: Player, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getDamageDealtByPlayer(player, filter).length > 0;
    }

    public wasUnitDamagedThisPhase(card: IUnitCard): boolean {
        return this.getCurrentValue().some(
            (entry) => entry.targets.some((target) => target === card)
        );
    }

    public unitHasDealtDamage(card: Card, filter: (entry: UnwrapRef<DamageDealtEntry>) => boolean = () => true): boolean {
        return this.getCurrentValue()
            .filter((entry) =>
                card.canBeInPlay() &&
                entry.damageSourceCards.some((sourceCard, i) =>
                    EnumHelpers.isUnit(entry.damageSourceCardTypes[i]) &&
                    (sourceCard as unknown as Card) === card &&
                    entry.damageSourceInPlayIds[i] === this.getCardId(card)
                ) &&
                filter(entry)
            ).length > 0;
    }

    public unitHasDealtCombatDamageToBaseThisAttack(card: Card, context: TriggeredAbilityContext): boolean {
        return this.unitHasDealtDamage(
            card,
            (entry) =>
                entry.activeAttackId === context.event.attack.id &&
                ((entry.damageType === DamageType.Combat && entry.targets.some((target) => target.isBase())) || entry.damageType === DamageType.Overwhelm)
        );
    }

    public getDamageDealtToBaseByUnitThisAttack(card: Card, context: TriggeredAbilityContext): number {
        return this.getCurrentValue()
            .filter((entry) =>
                card.canBeInPlay() &&
                entry.damageSourceCards.some((sourceCard, i) =>
                    EnumHelpers.isUnit(entry.damageSourceCardTypes[i]) &&
                    (sourceCard as unknown as Card) === card &&
                    entry.damageSourceInPlayIds[i] === this.getCardId(card)
                ) &&
                entry.activeAttackId === context.event.attack.id &&
                ((entry.damageType === DamageType.Combat && entry.targets.some((target) => target.isBase())) || entry.damageType === DamageType.Overwhelm)
            )
            .reduce((total, entry) => total + entry.amount, 0);
    }

    public getNonLeaderUnitsDealtCombatDamageByUnitThisAttack(card: IUnitCard, context: TriggeredAbilityContext): Card[] {
        const damagedNonLeaderUnits = this.getCurrentValue()
            .filter((entry) =>
                entry.damageSourceCards.some((sourceCard, i) =>
                    (sourceCard as unknown as IUnitCard) === card &&
                    entry.damageSourceInPlayIds[i] === this.getCardId(card)
                ) &&
                entry.activeAttackId === context.event.attack.id &&
                entry.damageType === DamageType.Combat &&
                entry.amount > 0 &&
                entry.targetController !== card.controller &&
                entry.targets.some((target) => target !== context.event.attack.attacker && target.isNonLeaderUnit())
            )
            .flatMap((entry) => entry.targets.filter((target) => target !== context.event.attack.attacker && target.isNonLeaderUnit()));

        return [...new Set(damagedNonLeaderUnits)];
    }

    protected override setupWatcher() {
        this.addUpdater({
            when: {
                onDamageDealt: () => true,
            },
            update: (currentState: IDamageDealtThisPhase, event: any) => {
                let damageSourceCards: GameObjectId<IPlayableCard>[] = [];
                let damageSourceInPlayIds: (number | undefined)[] = [];
                let damageSourceCardTypes: CardType[] = [];
                let targets: GameObjectId<Card>[] = [];
                let activeAttackId: number = undefined;

                if (event.type === DamageType.Combat) {
                    const damageDealtBy: IUnitCard[] = event.damageSource.damageDealtBy ?? [];
                    damageSourceCards = damageDealtBy.map((unit) => unit.getObjectId() as unknown as GameObjectId<IPlayableCard>);
                    damageSourceInPlayIds = damageDealtBy.map((unit) => this.getCardId(unit));
                    damageSourceCardTypes = damageDealtBy.map((unit) => unit.type);
                    targets = [event.card.getObjectId()];
                    activeAttackId = event.damageSource.attack?.id;
                } else if (event.type === DamageType.Overwhelm) {
                    const attacker = event.damageSource.attack?.attacker;
                    damageSourceCards = [attacker.getObjectId() as unknown as GameObjectId<IPlayableCard>];
                    damageSourceInPlayIds = [this.getCardId(attacker)];
                    damageSourceCardTypes = [attacker.type];
                    targets = [event.card.getObjectId()];
                    activeAttackId = event.damageSource.attack?.id;
                } else if (event.type === DamageType.Ability) {
                    const sourceCard = event.damageSource.card;
                    damageSourceCards = [sourceCard.getObjectId()];
                    damageSourceCardTypes = [sourceCard.type];
                    // TODO FIX EMPTY DECK DAMAGE EVENT
                    damageSourceInPlayIds = ['canBeInPlay' in sourceCard && sourceCard.canBeInPlay() ? this.getCardId(sourceCard) : null];
                    targets = [event.card.getObjectId()];
                    activeAttackId = this.game.currentAttack?.id;
                }

                return currentState.concat({
                    damageType: event.type,
                    damageSourceCards,
                    damageSourceInPlayIds,
                    damageSourceCardTypes,
                    targets,
                    damageSourcePlayer: event.damageSource.player?.getObjectId(),
                    damageSourceEventId: event.damageSource.eventId,
                    targetType: event.card.type,
                    targetController: event.card.controller?.getObjectId(),
                    amount: event.damageDealt,
                    isIndirect: event.isIndirect,
                    activeAttackId,
                });
            }
        });
    }

    private getCardId(card: IInPlayCard) {
        if (card.isInPlay()) {
            return card.inPlayId;
        }

        if (card.zone.hiddenForPlayers == null) {
            return card.mostRecentInPlayId;
        }

        return null;
    }

    protected override getResetValue(): IDamageDealtThisPhase {
        return [];
    }
}
