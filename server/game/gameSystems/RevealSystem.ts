
import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { EventName, Location } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import { IViewCardProperties, ViewCardMode, ViewCardSystem } from './ViewCardSystem';

export type IRevealProperties = Omit<IViewCardProperties, 'viewType'>;

export class RevealSystem extends ViewCardSystem {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';
    public override readonly effectDescription = 'reveal a card';

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

    public override canAffect(card: BaseCard, context: AbilityContext): boolean {
        if (card.location === Location.Deck || card.location === Location.Hand || card.location === Location.Resource) {
            return super.canAffect(card, context);
        }
        return false;
    }

    public override getMessageArgs(event: any, context: AbilityContext, additionalProperties: any): any[] {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [
            properties.player || event.context.player,
            event.card,
            event.context.source
        ];
        return messageArgs;
    }
}
