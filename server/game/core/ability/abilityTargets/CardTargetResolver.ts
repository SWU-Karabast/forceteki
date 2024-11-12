import { ICardTargetResolver } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { TargetResolver } from './TargetResolver';
import CardSelectorFactory from '../../cardSelector/CardSelectorFactory';
import { Card } from '../../card/Card';
import { Stage, EffectName, LocationFilter, RelativePlayer, GameStateChangeRequired } from '../../Constants';
import type Player from '../../Player';
import * as Contract from '../../utils/Contract';
import * as Helpers from '../../utils/Helpers.js';
import * as EnumHelpers from '../../utils/EnumHelpers.js';
import { GameSystem } from '../../gameSystem/GameSystem';

/**
 * Target resolver for selecting cards for the target of an effect.
 */
export class CardTargetResolver extends TargetResolver<ICardTargetResolver<AbilityContext>> {
    private immediateEffect: GameSystem;
    private selector: any;

    public constructor(name: string, properties: ICardTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);

        this.selector = this.getSelector(properties);
        this.immediateEffect = properties.immediateEffect;

        if (this.properties.immediateEffect) {
            this.properties.immediateEffect.setDefaultTargetFn((context) => context.targets[name]);
        }

        this.validateLocationLegalForTarget(properties);
    }

    private getSelector(properties: ICardTargetResolver<AbilityContext>) {
        const cardCondition = (card, context) => {
            const contextCopy = this.getContextCopy(card, context);
            if (context.stage === Stage.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
                return false;
            }
            return (!this.dependentTarget || this.dependentTarget.hasLegalTarget(contextCopy)) &&
              (!properties.cardCondition || properties.cardCondition(card, contextCopy)) &&
              (properties.immediateEffect == null || properties.immediateEffect.hasLegalTarget(contextCopy, this.properties.mustChangeGameState));
        };
        return CardSelectorFactory.create(Object.assign({}, properties, { cardCondition: cardCondition, targets: true }));
    }

    private getContextCopy(card: Card, context: AbilityContext) {
        const contextCopy = context.copy();
        contextCopy.targets[this.name] = card;
        if (this.name === 'target') {
            contextCopy.target = card;
        }
        return contextCopy;
    }

    protected override hasLegalTarget(context: AbilityContext) {
        return this.selector.optional || this.selector.hasEnoughTargets(context, this.getChoosingPlayer(context));
    }

    private getAllLegalTargets(context: AbilityContext): Card[] {
        return this.selector.getAllLegalTargets(context, this.getChoosingPlayer(context));
    }

    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player) {
        // A player can always choose not to pick a card from a zone that is hidden from their opponents
        // if doing so would reveal hidden information(i.e. that there are one or more valid cards in that zone) (SWU Comp Rules 2.0 1.17.4)
        // TODO: test if picking a card from an opponent's usually hidden zone(e.g. opponent's hand) works as expected(the if block here should be skipped)
        const controller = typeof this.properties.controller === 'function' ? this.properties.controller(context) : this.properties.controller;
        if (CardTargetResolver.allZonesAreHidden(this.properties.locationFilter, controller) && this.selector.hasAnyCardFilter) {
            this.properties.optional = true;
            this.selector.optional = true;
            this.selector.oldDefaultActivePromptTitle = this.selector.defaultActivePromptTitle();
            this.selector.defaultActivePromptTitle = () => this.selector.oldDefaultActivePromptTitle.concat(' (because you are choosing from a hidden zone you may choose nothing)');
        }

        const legalTargets = this.selector.getAllLegalTargets(context, player);
        if (legalTargets.length === 0) {
            if (context.stage === Stage.PreTarget) {
                // if there are no targets at the pretarget stage, delay targeting until after costs are paid
                targetResults.delayTargeting = this;
                return;
            }
            return;
        }

        // if there are legal targets but this wouldn't have a gamestate-changing effect on any of them, we can just shortcut and skip selection
        // (unless there are dependent targets that might care about the targeting result)
        if (
            !this.dependentTarget &&
            !legalTargets.some((target) => this.immediateEffect.canAffect(
                target,
                this.getContextCopy(target, context),
                {},
                GameStateChangeRequired.MustFullyOrPartiallyResolve
            ))
        ) {
            return;
        }

        // if there's only one target available, automatically select it without prompting
        if (context.player.autoSingleTarget && legalTargets.length === 1) {
            this.setTargetResult(context, legalTargets[0]);
            return;
        }

        // create a copy of properties without cardCondition
        let extractedProperties;
        {
            const { cardCondition, ...otherProperties } = this.properties;
            extractedProperties = otherProperties;
        }

        const buttons = [];
        if (context.stage === Stage.PreTarget) {
            // TODO: figure out if we need these buttons
            /* if (!targetResults.noCostsFirstButton) {
                buttons.push({ text: 'Pay costs first', arg: 'costsFirst' });
            }
            buttons.push({ text: 'Cancel', arg: 'cancel' });*/
            if (passPrompt) {
                buttons.push({ text: passPrompt.buttonText, arg: passPrompt.arg });
                passPrompt.hasBeenShown = true;
            }
            if (this.selector.optional) {
                // If the selector is for a single card and it will automatically fire on selection,
                // uses the 'done' arg so that the prompt doesn't show both 'Choose no target' and 'Done' buttons.
                buttons.push({
                    text: 'Choose no target',
                    arg: this.selector.numCards === 1 && this.selector.automaticFireOnSelect(context) ? 'done' : 'noTarget'
                });
            }
        }
        const mustSelect = legalTargets.filter((card) =>
            card.getOngoingEffectValues(EffectName.MustBeChosen).some((restriction) => restriction.isMatch('target', context))
        );

        const promptProperties = Object.assign(this.getDefaultProperties(context), {
            selector: this.selector,
            buttons: buttons,
            mustSelect: mustSelect,
            onSelect: (player, card) => {
                this.setTargetResult(context, card);
                return true;
            },
            onCancel: () => {
                this.cancel(targetResults);
                return true;
            },
            onMenuCommand: (player: Player, arg) => {
                switch (arg) {
                    case 'costsFirst':
                        targetResults.payCostsFirst = true;
                        return true;

                    case passPrompt?.arg:
                        this.cancel(targetResults);
                        passPrompt.handler();
                        return true;

                    case 'cancel':
                    case 'noTarget':
                        return true;

                    default:
                        Contract.fail(`Unknown menu option '${arg}'`);
                }
            }
        });
        context.game.promptForSelect(player, Object.assign(promptProperties, extractedProperties));
    }

    public static allZonesAreHidden(locationFilter: LocationFilter | LocationFilter[], controller: RelativePlayer): boolean {
        return locationFilter && Helpers.asArray(locationFilter).every((location) => EnumHelpers.isHidden(location, controller));
    }

    private cancel(targetResults) {
        targetResults.cancelled = true;
    }

    protected override checkTarget(context: AbilityContext): boolean {
        if (!context.targets[this.name]) {
            return false;
        } else if (context.choosingPlayerOverride && this.getChoosingPlayer(context) === context.player) {
            return false;
        }
        let cards = context.targets[this.name];
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        return (cards.every((card) => this.selector.canTarget(card, context, context.choosingPlayerOverride || this.getChoosingPlayer(context))) &&
          this.selector.hasEnoughSelected(cards, context) && !this.selector.hasExceededLimit(cards, context));
    }

    protected override hasTargetsChosenByInitiatingPlayer(context: AbilityContext) {
        if (this.getChoosingPlayer(context) === context.player && (this.selector.optional || this.selector.hasEnoughTargets(context, context.player.opponent))) {
            return true;
        }
        return !this.properties.dependsOn && this.checkGameActionsForTargetsChosenByInitiatingPlayer(context);
    }

    private checkGameActionsForTargetsChosenByInitiatingPlayer(context: AbilityContext) {
        return this.getAllLegalTargets(context).some((card) => {
            const contextCopy = this.getContextCopy(card, context);
            if (this.properties.immediateEffect && this.properties.immediateEffect.hasTargetsChosenByInitiatingPlayer(contextCopy)) {
                return true;
            } else if (this.dependentTarget) {
                return this.dependentTarget.checkGameActionsForTargetsChosenByInitiatingPlayer(contextCopy);
            }
            return false;
        });
    }

    /**
     * Checks whether the target's provided location filters have at least one legal location for the provided
     * card types. This is to catch situations in which a mismatched location and card type was accidentally
     * provided, which would cause target resolution to always silently fail to find any legal targets.
     */
    private validateLocationLegalForTarget(properties) {
        if (!properties.locationFilter || !properties.cardTypeFilter) {
            return;
        }

        for (const type of Array.isArray(properties.cardTypeFilter) ? properties.cardTypeFilter : [properties.cardTypeFilter]) {
            const legalLocations = Helpers.defaultLegalLocationsForCardTypeFilter(type);
            if (legalLocations.some((location) => EnumHelpers.cardLocationMatches(location, properties.locationFilter))) {
                return;
            }
        }

        Contract.fail(`Target location filters '${properties.locationFilter}' for ability has no overlap with legal locations for target card types '${properties.cardTypeFilter}', so target resolution is guaranteed to find no legal targets`);
    }
}