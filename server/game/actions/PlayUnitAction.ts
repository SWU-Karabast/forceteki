import { AbilityRestriction, PlayType } from '../core/Constants.js';
import { PutIntoPlaySystem } from '../gameSystems/PutIntoPlaySystem.js';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { PlayCardAction } from '../core/ability/PlayCardAction.js';
import * as Contract from '../core/utils/Contract.js';
import type { Card } from '../core/card/Card.js';
import type Game from '../core/Game.js';
import type { FormatMessage } from '../core/chat/GameChat.js';
import * as ChatHelpers from '../core/chat/ChatHelpers.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';

export type IPlayUnitActionProperties = IPlayCardActionProperties & {
    entersReady?: boolean;
};

export class PlayUnitAction extends PlayCardAction {
    private entersReady: boolean;

    public constructor(game: Game, card: Card, properties: IPlayUnitActionProperties) {
        super(game, card, properties);

        // default to false
        this.entersReady = !!properties.entersReady;
    }

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isUnit());

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

        context.game.addMessage('{0} plays {1}{2}{3}', context.player, context.source, playTypeDescription, costDescription);
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayUnitAction(this.game, this.card, { ...this.createdWithProperties, ...overrideProperties });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.player.hasRestriction(AbilityRestriction.PlayUnit, context) ||
            context.player.hasRestriction(AbilityRestriction.PutIntoPlay, context) ||
            context.source.hasRestriction(AbilityRestriction.EnterPlay, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }
}
