import type { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import type { IUpgradeCard } from '../core/card/CardInterfaces';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import type { MsgArg } from '../core/chat/GameChat';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType, ZoneName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import type { PlayerOrCard } from '../core/gameSystem/GameSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';
import type { IDamageSource, IDefeatSource } from '../IDamageOrDefeatSource';
import { DefeatSourceType } from '../IDamageOrDefeatSource';

export interface IDefeatCardPropertiesBase extends ICardTargetSystemProperties {
    defeatSource?: IDamageSource | DefeatSourceType.Ability | DefeatSourceType.UniqueRule | DefeatSourceType.FrameworkEffect;
}

export interface IDefeatCardProperties extends IDefeatCardPropertiesBase {

    /**
     * Identifies the type of effect that triggered the defeat. If the defeat was caused by damage,
     * just pass in the damage source metadata. Otherwise, the defeat is due to an ability (default).
     */
    defeatSource?: IDamageSource | DefeatSourceType.Ability;
}

/** Records the "last known information" of a card before it left the arena, in case ability text needs to refer back to it. See SWU 8.12. */
export interface ILastKnownInformation {
    card: Card;
    title: string;
    controller: Player;
    arena: ZoneName;
    power?: number;
    hp?: number;
    type?: CardType;
    damage?: number;
    parentCard?: IUnitCard;
    upgrades?: IUpgradeCard[];
}

export class DefeatCardSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IDefeatCardPropertiesBase = IDefeatCardProperties> extends CardTargetSystem<TContext, TProperties> {
    public override readonly name = 'defeat';
    public override readonly eventName = EventName.OnCardDefeated;
    public override readonly costDescription = 'defeating {0}';
    public override effectDescription = 'defeat {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override readonly defaultProperties: Partial<IDefeatCardPropertiesBase> = {
        defeatSource: DefeatSourceType.Ability
    };

    public static defeatSourceCard(event): Card | undefined {
        if (!event) {
            return undefined;
        }

        Contract.assertTrue(event.name === EventName.OnCardDefeated);

        const defeatSource: IDefeatSource = event.defeatSource;
        if (defeatSource.type === DefeatSourceType.Attack) {
            return defeatSource.attack.attacker;
        } else if (defeatSource.type === DefeatSourceType.NonCombatDamage || defeatSource.type === DefeatSourceType.Ability) {
            return defeatSource.card;
        }

        return undefined;
    }

    public eventHandler(event): void {
        const card: Card = event.card;
        Contract.assertTrue(card.canBeExhausted());

        if (card.zoneName === ZoneName.Resource) {
            this.leavesResourceZoneEventHandler(card, event.context);
        } else if (card.isUpgrade()) {
            card.unattach(event);
        }

        if (card.isToken()) {
            // move the token out of the play area so that effect cleanup happens, then remove it from all card lists
            card.moveTo(ZoneName.OutsideTheGame);
        } else if (card.isDeployableLeader() && card.deployed) {
            card.undeploy();
        } else {
            card.moveTo(ZoneName.Discard);
        }
    }

    public override getTargetMessage(targets: PlayerOrCard | PlayerOrCard[], context: TContext): MsgArg[] {
        return super.getTargetMessage(targets, context).map((target) => {
            if (target instanceof Card && target.canBeExhausted() && target.zoneName === ZoneName.Resource) {
                return {
                    format: '{0} {1}',
                    args: [
                        target.exhausted ? 'an exhausted' : 'a ready',
                        target,
                    ]
                };
            }
            return target;
        });
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<TProperties> = {}, mustChangeGameState = GameStateChangeRequired.None): boolean {
        if (card.zoneName !== ZoneName.Resource && (!card.canBeInPlay() || !card.isInPlay())) {
            return false;
        }
        const properties = this.generatePropertiesFromContext(context);
        if ((properties.isCost || mustChangeGameState !== GameStateChangeRequired.None) && card.hasRestriction(AbilityRestriction.BeDefeated, context)) {
            return false;
        }
        return super.canAffectInternal(card, context);
    }

    protected override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<TProperties>): void {
        super.addPropertiesToEvent(event, card, context, additionalProperties);
        this.addDefeatSourceToEvent(event, card, context);
    }

    /** Generates metadata indicating what the source of the defeat is for relevant effects such as "when [X] attacks and defeats..." */
    private addDefeatSourceToEvent(event: any, card: Card, context: TContext) {
        // if this defeat is caused by damage, just use the same source as the damage event
        const { defeatSource } = this.generatePropertiesFromContext(context);

        const eventDefeatSource = this.buildDefeatSource(defeatSource, event, card, context);

        event.isDefeatedByAttacker = false;
        event.isDefeatedWhileAttacking = false;
        event.defeatSource = eventDefeatSource;

        try {
            if (eventDefeatSource.type === DefeatSourceType.Attack) {
                event.isDefeatedByAttacker = eventDefeatSource.damageDealtBy.includes(eventDefeatSource.attack.attacker);
                event.isDefeatedWhileAttacking = eventDefeatSource.damageDealtBy.some((unit) =>
                    eventDefeatSource.attack.getAllTargets().includes(unit)
                );
            } else if (eventDefeatSource.type === DefeatSourceType.Ability || eventDefeatSource.type === DefeatSourceType.NonCombatDamage) {
                if (eventDefeatSource.card.isUnit()) {
                    event.isDefeatedByAttacker = eventDefeatSource.card.isInPlay() &&
                      eventDefeatSource.card.isAttacking() &&
                      eventDefeatSource.card.activeAttack.targetIsUnit((unit) => unit === card, true);
                }

                event.isDefeatedWhileAttacking = card.isUnit() && card.isAttacking();
            }
        } catch (e) {
            debugger;
        }
    }

    protected buildDefeatSource(defeatSource: IDamageSource | DefeatSourceType.Ability | DefeatSourceType.UniqueRule | DefeatSourceType.FrameworkEffect, event: any, card: Card, context: TContext): IDefeatSource {
        if (typeof defeatSource === 'object') {
            if (defeatSource.type === DefeatSourceType.Attack) {
                return {
                    ...defeatSource,
                    player: defeatSource.damageDealtBy[0].controller // TODO: See if we can do this without [0]
                };
            }

            return {
                card: context.source,
                ...defeatSource,
                event,
                type: DefeatSourceType.NonCombatDamage,
            };
        }

        Contract.assertEqual(defeatSource, DefeatSourceType.Ability);

        // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
        return {
            type: DefeatSourceType.Ability,
            player: context.player,
            card: context.source,
            event,
        };
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<TProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);

        if (card.zoneName !== ZoneName.Resource) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        }

        this.addLastKnownInformationToEvent(event, card);
    }
}
