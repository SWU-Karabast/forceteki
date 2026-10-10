import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import { GameStateChangeRequired } from '../core/Constants';
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

    protected override readonly defaultProperties: IGameSystemInput<IRevealProperties> = {
        interactMode: ViewCardInteractMode.ViewOnly,
        promptedPlayer: RelativePlayer.Self,
        useDisplayPrompt: null
    };

    public override isReveal(): boolean {
        return true;
    }

    protected override checkEventConditionInternal(event, properties: IRevealProperties, additionalProperties: Partial<IGameSystemInput<IRevealProperties>> = {}): boolean {
        for (const card of event.cards) {
            if (!this.canAffectWithProperties(card, event.context, properties, GameStateChangeRequired.None, additionalProperties)) {
                return false;
            }
        }

        return true;
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: IRevealProperties): boolean {
        if (card.zoneName === ZoneName.Deck || card.zoneName === ZoneName.Hand || card.zoneName === ZoneName.Resource) {
            return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None);
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

    protected override addPropertiesToEvent(event, cards, context: TContext, properties: IRevealProperties): void {
        super.addPropertiesToEvent(event, cards, context, properties);

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
