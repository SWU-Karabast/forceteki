import { BaseStepWithPipeline } from './BaseStepWithPipeline.js';
import { SimpleStep } from './SimpleStep.js';
import { ZoneName, Stage, EventName, RelativePlayer, GameErrorSeverity } from '../Constants.js';
import { GameEvent } from '../event/GameEvent.js';
import type Game from '../Game.js';
import type { AbilityContext } from '../ability/AbilityContext.js';
import type { ITargetResult } from '../ability/abilityTargets/TargetResolver.js';
import type { ICostResult } from '../cost/ICost.js';
import type { Player } from '../Player.js';

export interface IPassAbilityHandler {
    buttonText: string;
    arg: string;
    hasBeenShown: boolean;
    playerChoosing: Player;
    handler: () => void;
}

export class AbilityResolver extends BaseStepWithPipeline {
    public context: AbilityContext;
    public resolutionComplete: boolean;
    public canCancel: boolean;
    public cancelled: boolean;

    private events: GameEvent[];
    private targetResults: ITargetResult;
    private costResults: ICostResult;
    private earlyTargetingOverride?: ITargetResult;
    private ignoredRequirements: string[];
    private currentAbilityResolver: AbilityResolver | null;
    private passButtonText: string;
    private passAbilityHandler?: IPassAbilityHandler;

    public constructor(game: Game, context: AbilityContext, optional = false, canCancel?: boolean, earlyTargetingOverride?: ITargetResult, ignoredRequirements: string[] = []) {
        super(game);

        this.context = context;
        this.events = [];
        this.targetResults = {};
        this.costResults = this.getCostResults();
        this.earlyTargetingOverride = earlyTargetingOverride;
        this.ignoredRequirements = ignoredRequirements;
        this.initialise();

        /** Indicates that we should skip all remaining ability resolution steps */
        this.cancelled = false;

        /**
         * Indicates to the calling pipeline that this ability is done resolving.
         * Otherwise, repeat ability resolution (e.g. if the user clicked "cancel" halfway through)
         */
        this.resolutionComplete = false;

        // if canCancel is not provided, we default to true if there is no previous ability resolver
        // this prevents us from trying to cancel an "inner" ability while the outer one still resolves
        // TODO: fix this flow so cancelling is more flexible
        this.canCancel = canCancel ?? game.currentAbilityResolver == null;

        this.currentAbilityResolver = game.currentAbilityResolver;
        game.currentAbilityResolver = this;

        // this is used when a triggered ability is marked optional to ensure that a "Pass" button
        // appears at the appropriate times during the prompt flow for that ability
        // TODO: add interface for this in Interfaces.ts when we convert to TS
        if (this.context.ability.optionalButtonTextOverride) {
            this.passButtonText = this.context.ability.optionalButtonTextOverride;
        } else {
            this.passButtonText = this.context.ability.isAttackAction() ? 'Pass attack' : 'Pass';
        }

        this.passAbilityHandler = (!!this.context.ability.optional || optional) ? {
            buttonText: this.passButtonText,
            arg: 'passAbility',
            hasBeenShown: false,
            playerChoosing: (this.context.ability.playerChoosingOptional ?? RelativePlayer.Self) === RelativePlayer.Self
                ? this.context.player
                : this.context.player.opponent,
            handler: () => {
                this.cancelled = true;
                this.resolutionComplete = true;
            }
        } : null;
    }

    private initialise() {
        this.pipeline.initialise([
            // new SimpleStep(this.game, () => this.createSnapshot()),
            new SimpleStep(this.game, () => this.checkAbility(), 'checkAbility'),
            new SimpleStep(this.game, () => this.resolveEarlyTargets(), 'resolveEarlyTargets'),
            new SimpleStep(this.game, () => this.checkForCancelOrPass(), 'checkForCancelOrPass'),
            new SimpleStep(this.game, () => this.openInitiateAbilityEventWindow(), 'openInitiateAbilityEventWindow'),
            new SimpleStep(this.game, () => this.resetGameAbilityResolver(), 'resetGameAbilityResolver')
        ]);
    }

    private checkAbility() {
        if (this.cancelled) {
            return;
        }

        this.context.stage = Stage.PreTarget;

        if (this.context.ability.meetsRequirements(this.context, this.ignoredRequirements, true) !== '') {
            this.cancelled = true;
            this.resolutionComplete = true;
            return;
        }

        // if the opponent is choosing whether or not to pass, show that prompt at this stage before any targeting / costs happen
        if (this.passAbilityHandler?.playerChoosing !== this.context.player) {
            this.checkForPass();
        }
    }

    private resolveEarlyTargets() {
        if (this.cancelled) {
            return;
        }

        if (this.earlyTargetingOverride) {
            this.targetResults = this.earlyTargetingOverride;
            return;
        }

        if (
            !this.context.ability.cannotTargetFirst &&
            !this.context.ability.hasTargetsChosenByPlayer(this.context, this.context.player.opponent)
        ) {
            // if the opponent is the one choosing whether to pass or not, we don't include the pass handler in the target resolver
            const passAbilityHandler = this.passAbilityHandler?.playerChoosing === this.context.player ? this.passAbilityHandler : null;

            this.targetResults = this.context.ability.resolveEarlyTargets(this.context, passAbilityHandler, this.canCancel);
        }
    }

    private checkForCancelOrPass() {
        if (this.cancelled) {
            return;
        }

        this.checkTargetResultCancelState();

        if (!this.cancelled && this.passAbilityHandler && !this.passAbilityHandler.hasBeenShown) {
            this.checkForPass();
        }
    }

    // TODO: figure out our story for snapshots
    // createSnapshot() {
    //     if([CardType.Unit, CardType.Base, CardType.Leader, CardType.Upgrade].includes(this.context.source.getType())) {
    //         this.context.cardStateWhenInitiated = this.context.source.createSnapshot();
    //     }
    // }

    private openInitiateAbilityEventWindow() {
        if (this.cancelled) {
            this.checkResolveIfYouDoNot();
            return;
        }
        let eventName = EventName.OnAbilityResolverInitiated;
        let eventProps = {};
        if (this.context.ability.isCardAbility()) {
            eventName = EventName.OnCardAbilityInitiated;
            eventProps = {
                card: this.context.source,
                ability: this.context.ability
            };
            if (this.context.ability.isActivatedAbility()) {
                this.events.push(new GameEvent(EventName.OnCardAbilityTriggered, this.context, {
                    player: this.context.player,
                    card: this.context.source
                }));
            }
        }
        this.events.push(new GameEvent(eventName, this.context, eventProps, () => this.queueInitiateAbilitySteps()));
        this.game.openEventWindow(this.events, this.context.ability.triggerHandlingMode);
    }

    // if there is an "if you do not" part of this ability, we need to resolve it if the main ability doesn't resolve
    private checkResolveIfYouDoNot() {
        if (!this.cancelled || !this.resolutionComplete) {
            return;
        }

        if (this.context.ability.isCardAbilityStep() && this.context.ability.properties?.ifYouDoNot) {
            const ifYouDoNotAbilityContext = this.context.ability.getSubAbilityStepContext(this.context);
            if (ifYouDoNotAbilityContext) {
                this.game.resolveAbility(ifYouDoNotAbilityContext);
            }
        }
    }

    private queueInitiateAbilitySteps() {
        this.game.queueSimpleStep(() => this.resolveCosts(), 'resolveCosts');
        this.game.queueSimpleStep(() => this.payCosts(), 'payCosts');
        this.game.queueSimpleStep(() => this.checkCostsWerePaid(), 'checkCostsWerePaid');
        this.game.queueSimpleStep(() => this.resolveTargets(), 'resolveTargets');
        this.game.queueSimpleStep(() => this.checkForCancel(), 'checkForCancel');
        this.game.queueSimpleStep(() => this.executeHandler(), 'executeHandler');
    }

    private checkForCancel() {
        if (this.cancelled) {
            return;
        }

        this.checkTargetResultCancelState();
    }

    private checkTargetResultCancelState() {
        this.cancelled = this.targetResults.cancelled;

        if (
            !this.cancelled &&
            this.targetResults.hasEffectiveTargets === false &&
            this.context.ability.getCosts(this.context).length === 0
        ) {
            this.cancelled = true;
            this.resolutionComplete = true;
        }
    }

    // TODO: add passHandler support here
    private resolveCosts() {
        if (this.cancelled) {
            return;
        }
        this.costResults.canCancel = this.canCancel;
        this.context.stage = Stage.Cost;
        this.context.ability.resolveCosts(this.context, this.costResults);
    }

    private getCostResults(): ICostResult {
        return {
            cancelled: false,
            canCancel: this.canCancel,
            events: [],
            playCosts: true,
            triggerCosts: true
        };
    }

    private checkForPass() {
        if (this.cancelled) {
            return;
        } else if (this.costResults.cancelled) {
            this.cancelled = true;
            return;
        }

        if (this.passAbilityHandler && !this.passAbilityHandler.hasBeenShown) {
            this.passAbilityHandler.hasBeenShown = true;
            this.game.promptWithHandlerMenu(this.passAbilityHandler.playerChoosing, {
                activePromptTitle: `Trigger the ability '${this.getAbilityPromptTitle(this.context)}' or pass`,
                choices: ['Trigger', this.passAbilityHandler.buttonText],
                handlers: [
                    () => undefined,
                    () => {
                        this.passAbilityHandler.handler();
                    }
                ]
            });
        }
    }

    private getAbilityPromptTitle(context) {
        if (context.overrideTitle) {
            return context.overrideTitle;
        }
        return context.ability.title;
    }

    private payCosts() {
        if (this.cancelled) {
            return;
        } else if (this.costResults.cancelled) {
            this.cancelled = true;
            return;
        }

        this.resolutionComplete = true;
        if (this.costResults.events.length > 0) {
            this.game.openEventWindow(this.costResults.events);
        }
    }

    private checkCostsWerePaid() {
        if (this.cancelled) {
            return;
        }
        this.cancelled = this.costResults.events.some((event) => event.isCancelled);
        if (this.cancelled) {
            this.game.addMessage('{0} attempted to use {1}, but did not successfully pay the required costs', this.context.player, this.context.source);
        }
    }

    private resolveTargets() {
        if (this.cancelled) {
            return;
        }
        this.context.stage = Stage.Target;

        const ability = this.context.ability;

        if (this.context.ability.hasTargets() && !ability.hasSomeLegalTarget(this.context) && !ability.canResolveWithoutLegalTargets) {
            // Ability cannot resolve, so display a message and cancel it
            this.game.addMessage('{0} attempted to use {1}, but there are insufficient legal targets', this.context.player, this.context.source);
            this.cancelled = true;
        } else if (this.targetResults.delayTargeting) {
            // Targeting was delayed due to an opponent needing to choose targets (which shouldn't happen until costs have been paid), so continue
            this.targetResults = ability.resolveRemainingTargets(this.context, this.targetResults.delayTargeting, null);
        } else if (this.targetResults.payCostsFirst || !ability.checkAllTargets(this.context)) {
            // Targeting was stopped by the player choosing to pay costs first, or one of the chosen targets is no longer legal. Retarget from scratch
            this.targetResults = ability.resolveTargets(this.context, null);
        }
    }

    private executeHandler() {
        if (this.cancelled) {
            this.checkResolveIfYouDoNot();
            for (const event of this.events) {
                event.cancel();
            }
            return;
        }

        // Increment limits (limits aren't used up on cards in hand)
        if (this.context.ability.limit && this.context.source.zoneName !== ZoneName.Hand &&
          (!this.context.cardStateWhenInitiated || this.context.cardStateWhenInitiated.zoneName === this.context.source.zoneName)) {
            this.context.ability.limit.increment(this.context.player);
        }

        this.context.ability.displayMessage(this.context);
        this.context.stage = Stage.Effect;

        this.context.ability.executeHandler(this.context);
    }

    private resetGameAbilityResolver() {
        this.game.currentAbilityResolver = this.currentAbilityResolver;
    }

    public override continue() {
        try {
            return this.pipeline.continue(this.game);
        } catch (err) {
            this.game.reportError(err, GameErrorSeverity.SevereGameMessageOnly);

            // if we hit an error resolving an ability, try to close out the ability gracefully and move on
            // to see if we can preserve a playable game state
            this.cancelled = true;
            this.resolutionComplete = true;

            return true;
        }
    }

    public override toString() {
        return `'AbilityResolver: ${this.context.ability}'`;
    }
}
