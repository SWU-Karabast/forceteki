import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { RelativePlayer } from '../core/Constants';
import { EventName, ZoneName } from '../core/Constants';
import type { Player } from '../core/Player';
import type { IViewCardProperties } from './ViewCardSystem';
import { ViewCardInteractMode, ViewCardSystem } from './ViewCardSystem';

export type IRevealProperties = IViewCardProperties & {
    promptedPlayer?: RelativePlayer;
};

export class RevealSystem<TContext extends AbilityContext = AbilityContext> extends ViewCardSystem<TContext, IRevealProperties> {
    public override readonly name = 'reveal';
    public override readonly eventName = EventName.OnCardRevealed;
    public override readonly costDescription = 'revealing {0}';
    public override readonly effectDescription = 'reveal {0}';

    protected override readonly defaultProperties: IRevealProperties = {
        interactMode: ViewCardInteractMode.ViewOnly,
        promptedPlayer: RelativePlayer.Self,
        useDisplayPrompt: null
    };

    public override checkEventCondition(event): boolean {
        for (const card of event.cards) {
            if (!this.canAffect(card, event.context)) {
                return false;
            }
        }

        return true;
    }

    public override canAffectInternal(card: Card, context: TContext): boolean {
        if (card.zoneName === ZoneName.Deck || card.zoneName === ZoneName.Hand || card.zoneName === ZoneName.Resource) {
            return super.canAffectInternal(card, context);
        }
        return false;
    }

    protected override getPromptedPlayer(properties: IRevealProperties, context: TContext): Player {
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

    public override addPropertiesToEvent(event, cards, context: TContext, additionalProperties: Record<string, any> = {}): void {
        super.addPropertiesToEvent(event, cards, context, additionalProperties);

        const eventCards: Card[] = event.cards;
        const zones = eventCards.map((card) => card.zoneName);

        if (eventCards.length === 0) {
            return;
        }

        // If all cards are from the same zone, set revealedFromZone to that zone
        if (zones.every((zone) => zone === zones[0])) {
            event.revealedFromZone = zones[0];
        }
    }
}
