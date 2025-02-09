import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { RelativePlayer } from '../core/Constants';
import { EventName, ZoneName } from '../core/Constants';
import type Player from '../core/Player';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardInteractMode, ViewCardSystem } from './ViewCardSystem';

export type IRevealProperties = IViewCardProperties & {
    promptedPlayer?: RelativePlayer;
};

export class RevealSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext, IRevealProperties> {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';

    protected override readonly defaultProperties: IRevealProperties = {
        interactMode: ViewCardInteractMode.ViewOnly,
        promptedPlayer: RelativePlayer.Self,
        useDisplayPrompt: false
    };

    public override checkEventCondition(event): boolean {
        for (const card of event.cards) {
            if (!this.canAffect(card, event.context)) {
                return false;
            }
        }

        return true;
    }

    public override canAffect(card: Card, context: TContext): boolean {
        if (card.zoneName === ZoneName.Deck || card.zoneName === ZoneName.Hand || card.zoneName === ZoneName.Resource) {
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

    protected override getChatMessage(properties: IViewCardProperties): string | null {
        return '{0} reveals {1} due to {2}';
    }

    protected override getPromptedPlayer(properties: IRevealProperties, context: TContext): Player {
        if (!properties.useDisplayPrompt) {
            return null;
        }

        if (!properties.promptedPlayer) {
            return context.player;
        }

        switch (properties.promptedPlayer) {
            case RelativePlayer.Opponent:
                return context.player.opponent;
            case RelativePlayer.Self:
                return context.player;
            default:
                throw new Error(`Unknown promptedPlayer value: ${properties.promptedPlayer}`);
        }
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
