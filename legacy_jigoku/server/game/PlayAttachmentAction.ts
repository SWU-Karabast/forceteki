import type { AbilityContext } from './AbilityContext';
import BaseAction from './BaseAction';
import { CardTypes, EventNames, Locations, Phases } from './Constants';
import { payTargetDependentFateCost } from './Costs';
import { attach } from './GameActions/GameActions';
import { parseGameMode } from './GameMode';
import type BaseCard from './basecard';

export class PlayAttachmentAction extends BaseAction {
    title = 'Play this attachment';

    constructor(card: BaseCard, ignoreType = false) {
        super(card, [payTargetDependentFateCost('target', ignoreType)], {
            location: [Locations.PlayArea, Locations.Provinces],
            gameAction: attach((context) => ({
                attachment: context.source,
                ignoreType: ignoreType,
                takeControl: context.source.controller !== context.player
            })),
            cardCondition: (card: BaseCard, context: AbilityContext) => context.source.canPlayOn(card)
        });
    }

    meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []) {
        if (
            !ignoredRequirements.includes('phase') &&
            context.game.currentPhase === Phases.Dynasty &&
            !parseGameMode(context.game.gameMode).dynastyPhaseCanPlayAttachments
        ) {
            return 'phase';
        }
        if (
            !ignoredRequirements.includes('location') &&
            !context.player.isCardInPlayableLocation(context.source, context.playType)
        ) {
            return 'location';
        }
        if (!ignoredRequirements.includes('cannotTrigger') && !context.source.canPlay(context, context.playType)) {
            return 'cannotTrigger';
        }

        if (context.source.anotherUniqueInPlay(context.player)) {
            return 'unique';
        }
        return super.meetsRequirements(context);
    }

    displayMessage(context: AbilityContext) {
        const target =
            context.target.type === CardTypes.Province && context.target.isFacedown()
                ? context.target.location
                : context.target;
        context.game.addMessage('{0} plays {1}, attaching it to {2}', context.player, context.source, target);
    }

    executeHandler(context: AbilityContext) {
        const cardPlayedEvent = context.game.getEvent(EventNames.OnCardPlayed, {
            player: context.player,
            card: context.source,
            context: context,
            originalLocation: context.source.location,
            originallyOnTopOfConflictDeck:
                context.player && context.player.conflictDeck && context.player.conflictDeck.first() === context.source,
            onPlayCardSource: (context as any).onPlayCardSource,
            playType: context.playType
        });
        context.game.openEventWindow([
            context.game.actions
                .attach({ attachment: context.source, takeControl: context.source.controller !== context.player })
                .getEvent(context.target, context),
            cardPlayedEvent
        ]);
    }

    isCardPlayed() {
        return true;
    }
}
