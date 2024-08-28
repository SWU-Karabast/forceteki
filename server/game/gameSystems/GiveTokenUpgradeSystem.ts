import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { CardTypeFilter, EventName, TokenName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface IGiveTokenUpgradeProperties extends ICardTargetSystemProperties {
    tokenType: TokenName,
    amount?: number
}

/** Base class for managing the logic for giving token upgrades to cards (currently shield and experience) */
export abstract class GiveTokenUpgradeSystem extends CardTargetSystem<IGiveTokenUpgradeProperties> {
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];

    public override eventHandler(event, additionalProperties = {}): void {
        const cardReceivingTokenUpgrade = event.card;
        const properties = this.generatePropertiesFromContext(event.context);

        if (
            !Contract.assertTrue(cardReceivingTokenUpgrade.isUnit()) ||
            !Contract.assertTrue(EnumHelpers.isArena(cardReceivingTokenUpgrade.location))
        ) {
            return;
        }

        for (let i = 0; i < properties.amount; i++) {
            const tokenUpgrade = event.context.game.generateToken(cardReceivingTokenUpgrade.controller, this.properties.tokenType);
            tokenUpgrade.owner.moveCard(tokenUpgrade, cardReceivingTokenUpgrade.location);
            cardReceivingTokenUpgrade.attachUpgrade(tokenUpgrade);
        }
    }

    public override getEffectMessage(context: AbilityContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['attach a {0} to {1}', [properties.tokenType, properties.target]];
        }
        return ['attach {0} {1}s to {2}', [properties.amount, properties.tokenType, properties.target]];
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
