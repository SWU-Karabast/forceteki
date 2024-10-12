import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { CardTypeFilter, EventName, TokenName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { IGameSystemProperties } from '../core/gameSystem/GameSystem';
import * as Contract from '../core/utils/Contract';
import * as EnumHelpers from '../core/utils/EnumHelpers';

export interface IGiveTokenUpgradeProperties extends ICardTargetSystemProperties {
    tokenType: TokenName;
    amount?: number;
}

/** Base class for managing the logic for giving token upgrades to cards (currently shield and experience) */
export abstract class GiveTokenUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IGiveTokenUpgradeProperties> {
    public override readonly eventName = EventName.OnUpgradeAttached;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];

    public override eventHandler(event, additionalProperties = {}): void {
        const cardReceivingTokenUpgrade = event.card;
        const properties = this.generatePropertiesFromContext(event.context);

        Contract.assertTrue(cardReceivingTokenUpgrade.isUnit());
        Contract.assertTrue(cardReceivingTokenUpgrade.isInPlay());

        for (let i = 0; i < properties.amount; i++) {
            const tokenUpgrade = event.context.game.generateToken(event.context.source.controller, properties.tokenType);
            tokenUpgrade.attachTo(cardReceivingTokenUpgrade);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['attach a {0} to {1}', [properties.tokenType, properties.target]];
        }
        return ['attach {0} {1}s to {2}', [properties.amount, properties.tokenType, properties.target]];
    }

    public override canAffect(card: Card, context: TContext, additionalProperties = {}): boolean {
        const properties = this.generatePropertiesFromContext(context);

        Contract.assertNotNullLike(context);
        Contract.assertNotNullLike(context.player);
        Contract.assertNotNullLike(card);

        if (
            !card.isUnit() ||
            !card.isInPlay() ||
            properties.amount === 0
        ) {
            return false;
        }

        return super.canAffect(card, context);
    }

    public override checkEventCondition(event, additionalProperties): boolean {
        return this.canAffect(event.card, event.context, additionalProperties);
    }

    protected override addPropertiesToEvent(event, card: Card, context: TContext, additionalProperties): void {
        event.name = this.eventName;
        event.card = card;
        event.context = context;
    }
}
