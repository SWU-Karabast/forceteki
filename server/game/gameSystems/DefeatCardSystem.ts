import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { IUpgradeCard } from '../core/card/CardInterfaces';
import type { IUnitCard } from '../core/card/propertyMixins/UnitProperties';
import { AbilityRestriction, CardType, EventName, GameStateChangeRequired, WildcardCardType, ZoneName } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
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
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override readonly defaultProperties: IDefeatCardProperties = {
        defeatSource: DefeatSourceType.Ability
    };

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

    public override getEffectMessage(context: TContext, additionalProperties: Partial<TProperties> = {}): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        return ['defeat {0}', [properties.target]];
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

        let eventDefeatSource: IDefeatSource;

        event.isDefeatedByAttacker = false;
        if (typeof defeatSource === 'object') {
            eventDefeatSource = { ...defeatSource };

            if (eventDefeatSource?.type === DefeatSourceType.Attack) {
                eventDefeatSource.player = eventDefeatSource.damageDealtBy[0].controller; // TODO: See if we can do this without [0]
            } else {
                eventDefeatSource.type = DefeatSourceType.NonCombatDamage;
            }
        } else {
            eventDefeatSource = this.buildDefeatSourceForType(defeatSource, event, context);
        }
        event.defeatSource = eventDefeatSource;

        if (eventDefeatSource.type === DefeatSourceType.Attack) {
            event.isDefeatedByAttacker = eventDefeatSource.damageDealtBy.includes(eventDefeatSource.attack.attacker);
        } else if ((eventDefeatSource.type === DefeatSourceType.Ability || eventDefeatSource.type === DefeatSourceType.NonCombatDamage) && eventDefeatSource.card.isUnit()) {
            event.isDefeatedByAttacker = eventDefeatSource.card.isInPlay() &&
              eventDefeatSource.card.isAttacking() &&
              eventDefeatSource.card.activeAttack.targetIsUnit((unit) => unit === card, true);
        }
    }

    protected buildDefeatSourceForType(defeatSourceType: DefeatSourceType, event: any, context: TContext): IDefeatSource | null {
        Contract.assertEqual(defeatSourceType, DefeatSourceType.Ability);

        // TODO: confirm that this works when the player controlling the ability is different than the player controlling the card (e.g., bounty)
        return {
            type: DefeatSourceType.Ability,
            player: context.player,
            card: context.source,
            event
        };
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<TProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);

        if (card.zoneName !== ZoneName.Resource) {
            this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
        }

        this.addLastKnownInformationToEvent(event, card);
    }

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
}
