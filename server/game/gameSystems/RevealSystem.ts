
import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { EventName } from '../core/Constants';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Player from '../core/Player';

export interface IRevealProperties extends ICardTargetSystemProperties {
    chatMessage?: boolean;
    player?: Player;
    onDeclaration?: boolean;
}

export class RevealSystem extends CardTargetSystem {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';
    public override readonly effectDescription = 'reveal a card';

    protected override readonly defaultProperties: IRevealProperties = { chatMessage: false };

    public constructor(properties: ((context: AbilityContext) => IRevealProperties) | IRevealProperties) {
        super(properties);
    }

    public override canAffect(card: BaseCard, context: AbilityContext): boolean {
        //TODO: Are there situations where a card can't be revealed?
        // if (!card.isFacedown() && (card.isInProvince() || card.location === Location.PlayArea)) {
        //     return false;
        // }
        return super.canAffect(card, context);
    }

    public override addPropertiesToEvent(event, card: BaseCard, context: AbilityContext, additionalProperties): void {
        const { onDeclaration } = this.generatePropertiesFromContext(context, additionalProperties) as IRevealProperties;
        event.onDeclaration = onDeclaration;
        super.addPropertiesToEvent(event, card, context, additionalProperties);
    }

    public override eventHandler(event, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(event.context, additionalProperties) as IRevealProperties;
        if (properties.chatMessage) {
            event.context.game.addMessage(
                '{0} reveals {1} due to {2}',
                properties.player || event.context.player,
                event.card,
                event.context.source
            );
        }
        // TODO determine if this does anything/is needed
        // event.card.facedown = false;
    }
}
