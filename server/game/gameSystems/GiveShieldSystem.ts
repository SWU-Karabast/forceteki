import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { CardTypeFilter, EventName, TokenName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IGiveShieldProperties extends ICardTargetSystemProperties {}

export class GiveShieldSystem extends CardTargetSystem<IGiveShieldProperties> {
    public override readonly name = 'give shield';
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];

    public override eventHandler(event, additionalProperties = {}): void {
        const cardReceivingShield = event.card;

        if (
            !Contract.assertTrue(cardReceivingShield.isUnit()) ||
            !Contract.assertTrue(EnumHelpers.isArena(cardReceivingShield.location))
        ) {
            return;
        }

        const shieldToken = event.context.game.generateToken(cardReceivingShield.controller, TokenName.Shield);
        shieldToken.owner.moveCard(shieldToken, cardReceivingShield.location);
        cardReceivingShield.attachUpgrade(shieldToken);
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['attach shield to {0}', [properties.target]];
    }

    public override canAffect(card: Card, context: AbilityContext, additionalProperties = {}): boolean {
        if (
            !Contract.assertNotNullLike(context) ||
            !Contract.assertNotNullLike(context.player) ||
            !Contract.assertNotNullLike(card)
        ) {
            return false;
        }

        if (!card.isUnit() || !EnumHelpers.isArena(card.location)) {
            return false;
        }
        return super.canAffect(card, context);
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.card, event.context, additionalProperties);
    }

    public override addPropertiesToEvent(event, card: Card, context: AbilityContext, additionalProperties): void {
        event.name = this.eventName;
        event.card = card;
        event.context = context;
    }
}
