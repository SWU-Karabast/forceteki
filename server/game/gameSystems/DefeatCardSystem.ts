import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, EventName, Location, WildcardCardType } from '../core/Constants';
import { type ICardTargetSystemProperties, CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import * as EnumHelpers from '../core/utils/EnumHelpers';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface IDefeatCardProperties extends ICardTargetSystemProperties {}

export class DefeatCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IDefeatCardProperties> {
    public override readonly name = 'defeat';
    public override readonly eventName = EventName.OnCardDefeated;
    public override readonly costDescription = 'defeating {0}';
    protected override readonly targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade];

    public constructor(propertyFactory) {
        super(propertyFactory);
    }

    public eventHandler(event, additionalProperties = {}): void {
        if (event.card.isUpgrade()) {
            event.card.unattach();
        }

        if (event.card.isToken()) {
            // move the token out of the play area so that effect cleanup happens, then remove it from all card lists
            event.card.owner.moveCard(event.card, Location.OutsideTheGame, event.options || {});
            event.context.game.removeTokenFromPlay(event.card);
        } else if (event.card.isLeader()) {
            event.card.undeploy();
        } else {
            event.card.owner.moveCard(event.card, Location.Discard, event.options || {});
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        return ['defeat {0}', [properties.target]];
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (
            card.location !== Location.Resource &&
            (!card.canBeInPlay() || !card.isInPlay())
        ) {
            return false;
        }
        return super.canAffect(card, context);
    }

    /** Returns true if this system is enacting the pending defeat (i.e., delayed defeat from damage) for the specified card */
    protected override isPendingDefeatFor(card: Card, context: TContext) {
        const { target } = this.generatePropertiesFromContext(context);

        if (Array.isArray(target)) {
            if (target.length === 1) {
                return target[0] === card;
            }
            return false;
        }

        return target === card;
    }

    protected override updateEvent(event, card: Card, context: TContext, additionalProperties): void {
        this.addLeavesPlayPropertiesToEvent(event, card, context, additionalProperties);
    }
}
