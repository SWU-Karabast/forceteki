import { AbilityRestriction, PlayType, ZoneName } from '../core/Constants.js';
import type { Restriction } from '../core/ongoingEffect/effectImpl/Restriction.js';
import { PutIntoPlaySystem } from '../gameSystems/PutIntoPlaySystem.js';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { PlayCardAction } from '../core/ability/PlayCardAction.js';
import { Contract } from '../core/utils/Contract.js';
import type { Card } from '../core/card/Card.js';
import type { Game } from '../core/Game';
import type { FormatMessage } from '../core/chat/GameChat.js';
import * as ChatHelpers from '../core/chat/ChatHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Player } from '../core/Player.js';
import { registerState, registerStateBase } from '../core/GameObjectUtils';

export type IPlayUnitActionProperties = IPlayCardActionProperties & {
    entersReady?: boolean;
};

@registerStateBase()
export abstract class PlayUnitActionBase extends PlayCardAction {
    private entersReady: boolean;

    public constructor(game: Game, card: Card, properties: IPlayUnitActionProperties) {
        super(game, card, properties);

        // default to false
        this.entersReady = !!properties.entersReady;
    }

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isUnit());

        this.checkAndRearrangeResources(context);

        const events = [
            new PutIntoPlaySystem({
                target: context.source,
                controller: context.player,
                entersReady: this.entersReady
            }).generateEvent(context),
            this.generateOnPlayEvent(context)
        ];

        if (context.playType === PlayType.Smuggle) {
            this.addSmuggleEvent(events, context);
        }

        context.game.openEventWindow(events);
    }

    public override displayMessage(context: AbilityContext): void {
        let playTypeDescription = '';
        if (context.playType === PlayType.Smuggle) {
            playTypeDescription = ' using Smuggle';
        }
        let costDescription: FormatMessage | string = '';
        const costMessages = this.getCostsMessages(context);
        if (costMessages.length > 0) {
            costDescription = { format: `, ${ChatHelpers.formatWithLength(costMessages.length)}`, args: costMessages };
        }

        const locationDescription = ChatHelpers.getTargetLocationMessage(context.source, context, new Set([ZoneName.Hand]));
        context.game.addMessage('{0} plays {1}{2}{3}{4}', context.player, context.source, locationDescription, playTypeDescription, costDescription);
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayUnitAction(this.game, this.card, { ...this.createdWithProperties, ...overrideProperties });
    }

    /**
     * Check if playing a unit card is restricted for the given player and card.
     * @param player The player attempting to play the unit
     * @param card The unit card being played
     * @param context The context for restriction checks
     * @returns The Restriction blocking play, or null if not restricted
     */
    public static getPlayRestriction(player: Player, card: Card, context: AbilityContext): Restriction | null {
        return player.getMatchingRestrictions([AbilityRestriction.Play, AbilityRestriction.PlayUnit, AbilityRestriction.PutIntoPlay], context)[0] ??
          card.getMatchingRestrictions([AbilityRestriction.Play, AbilityRestriction.EnterPlay], context)[0] ??
          null;
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (PlayUnitAction.getPlayRestriction(context.player, context.source, context) != null) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }
}

// This class intentionally adds no logic.
// @registerState classes are terminal (cannot be further extended), but we still need
// a concrete, instantiable type for PlayUnitActionBase.
@registerState()
export class PlayUnitAction extends PlayUnitActionBase {}