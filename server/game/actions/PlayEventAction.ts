import { AbilityRestriction, EffectName, PlayType, RelativePlayer, ZoneName } from '../core/Constants.js';
import * as Contract from '../core/utils/Contract.js';
import type { PlayCardContext, IPlayCardActionProperties } from '../core/ability/PlayCardAction.js';
import { PlayCardAction } from '../core/ability/PlayCardAction.js';
import AbilityResolver from '../core/gameSteps/AbilityResolver.js';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { IEventCard } from '../core/card/EventCard.js';
import type { ITargetResult } from '../core/ability/abilityTargets/TargetResolver.js';

export class PlayEventAction extends PlayCardAction {
    private earlyTargetResults?: ITargetResult;

    public override executeHandler(context: PlayCardContext): void {
        Contract.assertTrue(context.source.isEvent());

        this.moveEventToDiscard(context);

        const eventAbility = context.source.getEventAbility();
        const abilityContext = eventAbility.createContext();
        abilityContext.playType = context.playType;
        if (this.earlyTargetResults) {
            this.copyContextTargets(context, abilityContext);
        }

        const abilityResolver = new AbilityResolver(context.game, abilityContext, false, null, this.earlyTargetResults, ['player']);

        context.game.queueStep(abilityResolver);
        context.game.queueSimpleStep(() => {
            // If the ability was cancelled it won't appears in the chat log so we need to log the message here
            if (abilityResolver.cancelled && abilityResolver.resolutionComplete) {
                this.game.addMessage('{0} plays {1}', context.player, context.source);
            }
        }, 'log play event action for cancelled resolutions');
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
    public override resolveEarlyTargets(context: PlayCardContext, passHandler = null, canCancel = false) {
        Contract.assertTrue(context.source.isEvent());

        const eventAbility = context.source.getEventAbility();

        // if the opponent will be making any selections or the ability is optional, then we need to do play in the correct order (i.e. move to discard first, then select)
        if (
            eventAbility.hasTargetsChosenByPlayer(context, context.player.opponent) ||
            eventAbility.playerChoosingOptional === RelativePlayer.Opponent ||
            eventAbility.optional ||
            this.usesExploit(context as unknown as AbilityContext<IEventCard>) ||
            eventAbility.cannotTargetFirst
        ) {
            return this.getDefaultTargetResults(context);
        }

        const eventAbilityContext = eventAbility.createContext();
        eventAbilityContext.playType = context.playType;

        this.copyContextTargets(context, eventAbilityContext);
        this.earlyTargetResults = eventAbility.resolveEarlyTargets(eventAbilityContext, passHandler, canCancel);

        this.game.queueSimpleStep(() => this.copyContextTargets(eventAbilityContext, context), 'copy event targets to play context');

        this.game.queueSimpleStep(() => {
            if (this.earlyTargetResults.cancelled || !this.earlyTargetResults.canCancel) {
                return;
            }

            const requirements = eventAbility.meetsRequirements(eventAbilityContext, ['player', 'zone'], true);
            if (requirements === '' && !context.source.isBlank() && context.source.isImplemented) {
                return;
            }

            let reason = '';
            if (requirements === 'gameStateChange') {
                reason = 'because its ability will not change the game state';
            } else if (context.source.isBlank()) {
                const blankSource = context.source.getOngoingEffectSources(EffectName.Blank);
                reason = `due to an ongoing effect of ${blankSource[0].title}`;
            } else if (!context.source.isImplemented) {
                reason = 'because the card is not implemented yet';
            }

            this.game.promptWithHandlerMenu(context.player, {
                activePromptTitle: `Playing ${context.source.title} will have no effect${reason.length > 0 ? ` ${reason}` : ''}`,
                choices: ['Play anyway', 'Cancel'],
                handlers: [
                    () => undefined,
                    () => {
                        this.earlyTargetResults.cancelled = true;
                    }
                ]
            });
        }, 'check if played event has any effect');

        return this.earlyTargetResults;
    }

    private copyContextTargets(from: AbilityContext, to: AbilityContext) {
        to.target = from.target;
        to.targets = from.targets;
        to.select = from.select;
        to.selects = from.selects;
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
