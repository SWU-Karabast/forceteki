import { AbilityContext } from '../core/ability/AbilityContext';
import { Card } from '../core/card/Card';
import { CardTypeFilter, EventName, TokenUpgradeName, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import * as Contract from '../core/utils/Contract';
import { AttachUpgradeSystem } from './AttachUpgradeSystem';

export interface IGiveTokenUpgradeProperties extends ICardTargetSystemProperties {
    amount?: number;
}

/** Base class for managing the logic for giving token upgrades to cards (currently shield and experience) */
export abstract class GiveTokenUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IGiveTokenUpgradeProperties> {
    public override readonly eventName = EventName.OnTokenCreated;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];
    protected override readonly defaultProperties: IGiveTokenUpgradeProperties = {
        amount: 1
    };

    // event handler doesn't do anything since the tokens were generated in updateEvent
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event, additionalProperties = {}): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);

        if (properties.amount === 1) {
            return ['attach a {0} to {1}', [this.getTokenType(), properties.target]];
        }
        return ['attach {0} {1}s to {2}', [properties.amount, this.getTokenType(), properties.target]];
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

    protected abstract getTokenType(): TokenUpgradeName;

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        super.updateEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // generate the tokens here so they can be used in the contingent events
        // it's fine if this event ends up being cancelled, unused tokens are cleaned up at the end of every round
        event.generatedTokens = [];
        for (let i = 0; i < properties.amount; i++) {
            event.generatedTokens.push(event.context.game.generateToken(event.context.source.controller, this.getTokenType()));
        }

        // add contingent events for attaching the generated upgrade token(s)
        event.setContingentEventsGenerator((event) => {
            const events = [];

            for (let i = 0; i < properties.amount; i++) {
                const attachUpgradeEvent = new AttachUpgradeSystem(() => ({
                    upgrade: event.generatedTokens[i],
                    target: card
                })).generateEvent(event.context);

                attachUpgradeEvent.order = event.order + 1;

                events.push(attachUpgradeEvent);
            }

            return events;
        });
    }

    public override addPropertiesToEvent(event: any, card: Card, context: TContext, additionalProperties?: any): void {
        Contract.assertTrue(card.isUnit());
        Contract.assertTrue(card.isInPlay());

        super.addPropertiesToEvent(event, card, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.amount = properties.amount;
        event.tokenType = this.getTokenType();
    }
}
