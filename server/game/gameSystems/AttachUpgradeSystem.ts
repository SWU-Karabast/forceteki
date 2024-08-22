import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { UnitCard } from '../core/card/CardTypes';
import { UpgradeCard } from '../core/card/UpgradeCard';
import { AbilityRestriction, CardTypeFilter, EventName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface IAttachUpgradeProperties extends ICardTargetSystemProperties {
    upgrade?: UpgradeCard;
    takeControl?: boolean;
    giveControl?: boolean;
    controlSwitchOptional?: boolean;
}

export class AttachUpgradeSystem extends CardTargetSystem<IAttachUpgradeProperties> {
    public override readonly name = 'attach';
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];
    protected override readonly defaultProperties: IAttachUpgradeProperties = {
        takeControl: false,
        giveControl: false,
    };

    public override eventHandler(event, additionalProperties = {}): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties);
        event.originalLocation = event.card.location;

        if (EnumHelpers.isArena(event.card.location)) {
            // if the upgrade is being moved, first remove it from its current parent
            event.card.parentCard.removeAttachment(event.card);
        } else {
            event.card.controller.removeCardFromPile(event.card);
            event.card.new = true;
            event.card.moveTo(event.parentCard.location);
        }

        event.parentCard.upgrades.push(event.card);
        event.card.parentCard = event.parentCard;
        if (properties.takeControl) {
            event.card.controller = event.context.player;
            event.card.updateConstantAbilityContexts();
        } else if (properties.giveControl) {
            event.card.controller = event.context.player.opponent;
            event.card.updateConstantAbilityContexts();
        }
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        if (properties.takeControl) {
            return [
                'take control of and attach {2}\'s {1} to {0}',
                [properties.target, properties.upgrade, properties.upgrade.parentCard]
            ];
        } else if (properties.giveControl) {
            return [
                'give control of and attach {2}\'s {1} to {0}',
                [properties.target, properties.upgrade, properties.upgrade.parentCard]
            ];
        }
        return ['attach {1} to {0}', [properties.target, properties.upgrade]];
    }

    public override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const contextCopy = context.copy({ source: card });

        if (
            !Contract.assertNotNullLike(context) ||
            !Contract.assertNotNullLike(context.player) ||
            !Contract.assertNotNullLike(card) ||
            !Contract.assertNotNullLike(properties.upgrade)
        ) {
            return false;
        }

        if (!card.isUnit()) {
            return false;
        }
        if (!properties.upgrade.canAttach((card as UnitCard), this.getFinalController(properties, context))) {
            return false;
        } else if (
            !properties.controlSwitchOptional &&
            properties.takeControl &&
            properties.upgrade.controller === context.player
        ) {
            return false;
        } else if (
            !properties.controlSwitchOptional &&
            properties.giveControl &&
            properties.upgrade.controller !== context.player
        ) {
            return false;
        } else if (card.hasRestriction(AbilityRestriction.EnterPlay, context)) {
            return false;
        } else if (context.player.hasRestriction(AbilityRestriction.PutIntoPlay, contextCopy)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.parent, event.context, additionalProperties);
    }

    public override isEventFullyResolved(event, card: Card, context: AbilityContext, additionalProperties): boolean {
        const { upgrade } = this.generatePropertiesFromContext(context, additionalProperties);
        return event.parent === card && event.card === upgrade && event.name === this.eventName && !event.cancelled;
    }

    public override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        const { upgrade } = this.generatePropertiesFromContext(context, additionalProperties);
        event.name = this.eventName;
        event.parent = card;
        event.card = upgrade;
        event.context = context;
    }

    private getFinalController(properties, context) {
        if (properties.takeControl) {
            return context.player;
        } else if (properties.giveControl) {
            return context.player.opponent;
        }

        return properties.attachment.controller;
    }
}