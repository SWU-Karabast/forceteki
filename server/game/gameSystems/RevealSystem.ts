
import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { Card } from '../core/card/Card';
import { EventName, Location } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { GameSystem } from '../core/gameSystem/GameSystem';
import * as Helpers from '../core/utils/Helpers';
import { IViewCardProperties, ViewCardMode, ViewCardSystem } from './ViewCardSystem';

export type IRevealProperties = Omit<IViewCardProperties, 'viewType'>;

export class RevealSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext> {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';

    protected override readonly defaultProperties: IViewCardProperties = {
        sendChatMessage: true,
        message: '{0} reveals {1} due to {2}',
        viewType: ViewCardMode.Reveal
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IRevealProperties | ((context?: AbilityContext) => IRevealProperties)) {
        const propsWithViewType = GameSystem.appendToPropertiesOrPropertyFactory<IViewCardProperties, 'viewType'>(propertiesOrPropertyFactory, { viewType: ViewCardMode.Reveal });
        super(propsWithViewType);
    }

    public override checkEventCondition(event): boolean {
        for (const card of event.cards) {
            if (!this.canAffect(card, event.context)) {
                return false;
            }
        }

        return true;
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (card.location === Location.Deck || card.location === Location.Hand || card.location === Location.Resource) {
            return super.canAffect(card, context);
        }
        return false;
    }

    public override getMessageArgs(event: any, context: TContext, additionalProperties: any): any[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [
            properties.player || event.context.player,
            event.cards.map((card) => card.title).join(', '),
            event.context.source
        ];
        return messageArgs;
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        if (Array.isArray(properties.target) && properties.target.length > 1) {
            return [
                'reveal {0} cards',
                [properties.target.length]
            ];
        }
        return [
            'reveal a card',
            []
        ];
    }
}
