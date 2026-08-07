import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import type { CardTypeFilter } from '../core/Constants';
import { TokenUpgradeName } from '../core/Constants';
import { EventName, GameStateChangeRequired, WildcardCardType } from '../core/Constants';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type { GameEvent } from '../core/event/GameEvent';
import { Contract } from '../core/utils/Contract';
import { Helpers } from '../core/utils/Helpers';
import { ChatHelpers } from '../core/chat/ChatHelpers';
import { EnumHelpers } from '../core/utils/EnumHelpers';
import { AttachUpgradeSystem } from './AttachUpgradeSystem';
import type { Player } from '../core/Player';

export interface IGiveTokenUpgradeProperties extends ICardTargetSystemProperties {
    tokenType: TokenUpgradeName;
    amount?: number;

    /** Shield-only: whether the created Shield token should be removed before other shields when preventing damage. Ignored for other token types. */
    highPriorityRemoval?: boolean;
}

/** Handles the logic for giving token upgrades (Shield, Experience, Advantage) to cards. The specific token is set via `tokenType` (see the give* factory methods in GameSystemLibrary). */
export class GiveTokenUpgradeSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IGiveTokenUpgradeProperties> {
    public override readonly name = 'giveTokenUpgrade';
    public override readonly eventName = EventName.OnTokensCreated;
    protected override readonly targetTypeFilter: CardTypeFilter[] = [WildcardCardType.Unit];
    protected override readonly defaultProperties: Omit<IGiveTokenUpgradeProperties, 'tokenType'> = {
        amount: 1
    };

    // event handler doesn't do anything since the tokens were generated in updateEvent
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const tokenTitle = EnumHelpers.tokenTitle[properties.tokenType];
        const indefiniteArticle = new Set([TokenUpgradeName.Experience, TokenUpgradeName.Advantage])
            .has(properties.tokenType) ? 'an' : 'a';

        return ['give {0} to {1}', [ChatHelpers.pluralize(properties.amount, `${indefiniteArticle} ${tokenTitle} token`, `${tokenTitle} tokens`), this.getTargetMessage(properties.target, context)]];
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

        // generateRetargetedEvent does the standard createEvent + updateEvent, but (unlike CardTargetSystem.generateEvent)
        // without asserting a single target, so it can build one event spanning every affected unit
        events.push(this.generateRetargetedEvent(cards, context, additionalProperties));
    }

    // a batched give can target multiple units, so condition on whether any targeted unit can still be affected
    // (the base reads the single `event.card`, which is the whole array for a multi-target give)
    public override checkEventCondition(event: any, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): boolean {
        return Helpers.asArray(event.cards).some((card: Card) =>
            this.canAffect(card, event.context, additionalProperties, GameStateChangeRequired.MustFullyResolve));
    }

    protected generateToken(context: TContext, owner: Player) {
        const properties = this.generatePropertiesFromContext(context);

        // highPriorityRemoval only affects Shield tokens; game.generateToken ignores it for other token types
        return context.game.generateToken(owner, properties.tokenType, { highPriorityRemoval: properties.highPriorityRemoval });
    }

    // standard updateEvent override: let the base set the common properties/handler/condition, then generate the tokens
    // and the contingent attach events. `cards` is a single card on the single-target generateEvent path (e.g. from
    // DistributeAmongTargetsSystem) and an array on the batched queueGenerateEventGameSteps path.
    protected override updateEvent(event, cards: Card | Card[], context: TContext, additionalProperties: Partial<IGiveTokenUpgradeProperties> = {}): void {
        super.updateEvent(event, cards, context, additionalProperties);

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        // generate the tokens here so they can be used in the contingent events
        // it's fine if this event ends up being cancelled, unused tokens are cleaned up at the end of every round
        event.generatedTokens = [];
        const generatedTokensByCard = new Map<Card, any[]>();
        for (const card of Helpers.asArray(cards)) {
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

        super.addPropertiesToEvent(event, cards, context, additionalProperties);

        // A batched give can target multiple units. `event.cards` is the full set of targets; `event.card` keeps the
        // single-target convention (read as a scalar Card by e.g. DistributeAmongTargetsSystem's chat message and the
        // replacement-effect prompt title) and is null when several units are targeted, so callers read `event.cards`.
        event.cards = cardsArray;
        event.card = cardsArray.length === 1 ? cardsArray[0] : null;

        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        event.amount = properties.amount;
        event.tokenType = properties.tokenType;
    }
}
