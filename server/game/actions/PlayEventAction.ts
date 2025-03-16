import { AbilityRestriction, ZoneName, PlayType } from '../core/Constants.js';
import * as Contract from '../core/utils/Contract.js';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { PlayCardAction } from '../core/ability/PlayCardAction.js';
import AbilityResolver from '../core/gameSteps/AbilityResolver.js';

export class PlayEventAction extends PlayCardAction {
    private earlyTargetResults?: any;

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        this.moveEventToDiscard(context);

        const abilityContext = context.source.getEventAbility().createContext();
        // if (this.earlyTargetResults) {
        //     abilityContext.target = context.target;
        //     abilityContext.targets = context.targets;
        //     abilityContext.select = context.select;
        //     abilityContext.selects = context.selects;
        // }
        abilityContext.target = context.target;
        abilityContext.targets = context.targets;
        abilityContext.select = context.select;
        abilityContext.selects = context.selects;

        context.game.queueStep(new AbilityResolver(context.game, abilityContext, false, null, true));
    }

    public override clone(overrideProperties: Partial<Omit<IPlayCardActionProperties, 'playType'>>) {
        return new PlayEventAction(this.game, this.card, { ...this.createdWithProperties, ...overrideProperties });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.player.hasRestriction(AbilityRestriction.PlayEvent, context) ||
            context.source.hasRestriction(AbilityRestriction.Play, context)
        ) {
            return 'restriction';
        }
        return super.meetsRequirements(context, ignoredRequirements);
    }

    /** Override that allows doing the card selection / prompting for an event card _before_ it is moved to discard for play so we can present a cancel option */
    public override resolveEarlyTargets(context, passHandler = null, canCancel = false) {
        Contract.assertTrue(context.source.isEvent());

        // this.earlyTargetResults = context.source.getEventAbility().resolveEarlyTargets(context, passHandler, canCancel);
        // return this.earlyTargetResults;

        const eventAbility = context.source.getEventAbility();

        // // if the opponent will be making any selections, then we need to do play in the correct order (i.e. move to discard first, then select)
        // if (eventAbility.hasTargetsChosenByPlayer(context, context.player.opponent) || eventAbility.playerChoosingOptional === RelativePlayer.Opponent) {
        //     return this.getDefaultTargetResults();
        // }

        return eventAbility.resolveEarlyTargets(context, passHandler, canCancel);
    }

    public moveEventToDiscard(context: PlayCardContext) {
        const cardPlayedEvent = this.generateOnPlayEvent(context, {
            resolver: this,
            handler: () => context.source.moveTo(ZoneName.Discard)
        });

        const events = [cardPlayedEvent];

        if (context.playType === PlayType.Smuggle) {
            this.addSmuggleEvent(events, context);
        }

        context.game.openEventWindow(events);
    }
}
