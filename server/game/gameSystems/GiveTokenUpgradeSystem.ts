import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { CardTypeFilter, TokenUpgradeName } from '../core/Constants';
import { EventName, WildcardCardType } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import * as ChatHelpers from '../core/chat/ChatHelpers';
import { AttachUpgradeSystem } from './AttachUpgradeSystem';

export interface IGiveTokenUpgradeProperties extends ICardTargetSystemProperties {
    amount?: number;
}

/** Base class for managing the logic for giving token upgrades to cards (currently shield and experience) */
export abstract class GiveTokenUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IGiveTokenUpgradeProperties> {
    public override readonly eventName = EventName.OnTokensCreated;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];
    protected override readonly defaultProperties: IGiveTokenUpgradeProperties = {
        amount: 1
    };

    // event handler doesn't do anything since the tokens were generated in updateEvent
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        return ['attach {0} to {1}', [ChatHelpers.pluralize(properties.amount, `a ${this.getTokenType()}`, `${this.getTokenType()}s`), this.getTargetMessage(properties.target, context)]];
    }

    public override canAffectInternal(card: Card, context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): boolean {
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

        return super.canAffectInternal(card, context);
    }

    protected abstract getTokenType(): TokenUpgradeName;

    protected generateToken(context: TContext) {
        return context.game.generateToken(context.player, this.getTokenType());
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties>): void {
        super.updateEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // generate the tokens here so they can be used in the contingent events
        // it's fine if this event ends up being cancelled, unused tokens are cleaned up at the end of every round
        event.generatedTokens = [];
        for (let i = 0; i < properties.amount; i++) {
            event.generatedTokens.push(this.generateToken(context));
        }

        // add contingent events for attaching the generated upgrade token(s)
        event.setContingentEventsGenerator((event) => {
            const events = [];

            for (let i = 0; i < properties.amount; i++) {
                const attachUpgradeEvent = new AttachUpgradeSystem({
                    upgrade: event.generatedTokens[i],
                    target: card
                }).generateEvent(event.context);

                attachUpgradeEvent.order = event.order + 1;

                events.push(attachUpgradeEvent);
            }

            return events;
        });
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: Partial<IGiveTokenUpgradeProperties>): void {
        Contract.assertTrue(card.isUnit());
        Contract.assertTrue(card.isInPlay());

        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.amount = properties.amount;
        event.tokenType = this.getTokenType();
    }
}
