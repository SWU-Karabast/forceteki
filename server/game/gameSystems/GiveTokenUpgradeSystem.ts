import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { CardTypeFilter, TokenUpgradeName } from '../core/Constants';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { AttachUpgradeSystem } from './AttachUpgradeSystem';
import type { Player } from '../core/Player';

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

    /**
     * All units receiving a token upgrade from a single ability are part of one creation event. We emit a single
     * {@link EventName.OnTokensCreated} event covering every target (rather than the default one-event-per-target),
     * so that effects which replace a token-creation event (e.g. Moff Jerjerrod) see and replace the whole event.
     */
    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const cards = Helpers.asArray(target).filter((card) => this.canAffect(card, context, additionalProperties));

        if (cards.length === 0) {
            return;
        }

        const event = this.createEvent(cards[0], context, additionalProperties);
        this.updateEventForCards(event, cards, context, additionalProperties);
        events.push(event);
    }

    // route the single-target generateEvent path (used by e.g. DistributeAmongTargetsSystem) through the batched logic
    protected override updateEvent(event, card: Card, context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): void {
        this.updateEventForCards(event, Helpers.asArray(card), context, additionalProperties);
    }

    public override checkEventCondition(event: any, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): boolean {
        return Helpers.asArray(event.cards).some((card: Card) =>
            this.canAffect(card, event.context, additionalProperties, GameStateChangeRequired.MustFullyResolve));
    }

    protected abstract getTokenType(): TokenUpgradeName;

    protected generateToken(context: TContext, owner: Player) {
        return context.game.generateToken(owner, this.getTokenType());
    }

    private updateEventForCards(event, cards: Card[], context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties>): void {
        this.addPropertiesToEvent(event, cards, context, additionalProperties);
        event.setHandler((event) => this.eventHandler(event));
        event.condition = () => this.checkEventCondition(event, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // generate the tokens here so they can be used in the contingent events
        // it's fine if this event ends up being cancelled, unused tokens are cleaned up at the end of every round
        event.generatedTokens = [];
        const generatedTokensByCard = new Map<Card, any[]>();
        for (const card of cards) {
            const tokensForCard = [];
            for (let i = 0; i < properties.amount; i++) {
                const token = this.generateToken(context, card.controller);
                tokensForCard.push(token);
                event.generatedTokens.push(token);
            }
            generatedTokensByCard.set(card, tokensForCard);
        }

        // add contingent events for attaching the generated upgrade token(s) to each affected unit
        event.setContingentEventsGenerator((event) => {
            const events = [];

            for (const [card, tokens] of generatedTokensByCard) {
                for (const token of tokens) {
                    const attachUpgradeEvent = new AttachUpgradeSystem({
                        upgrade: token,
                        target: card
                    }).generateEvent(event.context);

                    attachUpgradeEvent.order = event.order + 1;

                    events.push(attachUpgradeEvent);
                }
            }

            return events;
        });
    }

    protected override addPropertiesToEvent(event: any, cards: Card | Card[], context: TContext, additionalProperties?: Partial<IGiveTokenUpgradeProperties>): void {
        const cardsArray = Helpers.asArray(cards);

        Contract.assertTrue(cardsArray.length > 0, 'Attempting to give a token upgrade with no target units');
        for (const card of cardsArray) {
            Contract.assertTrue(card.isUnit());
            Contract.assertTrue(card.isInPlay());
        }

        // sets event.player and event.contingentSourceEvent (and event.card = cardsArray[0] as the representative target)
        super.addPropertiesToEvent(event, cardsArray[0], context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.cards = cardsArray;
        event.amount = properties.amount;
        event.tokenType = this.getTokenType();
    }
}
