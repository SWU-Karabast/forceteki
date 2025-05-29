import type { ICardTargetResolver, ICardTargetsResolver } from '../../../TargetInterfaces';
import type { AbilityContext } from '../AbilityContext';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import { TargetResolver } from './TargetResolver';
import * as CardSelectorFactory from '../../cardSelector/CardSelectorFactory';
import type { Card } from '../../card/Card';
import type { RelativePlayer, ZoneFilter, ZoneName } from '../../Constants';
import { EffectName, GameStateChangeRequired, Stage, TargetMode } from '../../Constants';
import type { Player } from '../../Player';
import * as Contract from '../../utils/Contract';
import * as Helpers from '../../utils/Helpers.js';
import * as EnumHelpers from '../../utils/EnumHelpers.js';
import type { GameSystem } from '../../gameSystem/GameSystem';
import type { ISelectCardPromptProperties } from '../../gameSteps/PromptInterfaces';
import { SelectCardMode } from '../../gameSteps/PromptInterfaces';
import type { BaseCardSelector } from '../../cardSelector/BaseCardSelector';

/**
 * Target resolver for selecting cards for the target of an effect.
 */
export class CardTargetResolver extends TargetResolver<ICardTargetsResolver<AbilityContext>> {
    private immediateEffect: GameSystem;
    private selector: BaseCardSelector<AbilityContext>;

    private static choosingFromHiddenPrompt = '\n(because you are choosing from a hidden zone you may choose nothing)';

    public static allZonesAreHidden(zoneFilter: ZoneFilter | ZoneFilter[], controller: RelativePlayer): boolean {
        if (!zoneFilter) {
            return false;
        }
        const zoneArray = Helpers.asArray(zoneFilter);
        return zoneArray.length > 0 && zoneArray.every((zone) => EnumHelpers.isHiddenFromOpponent(zone, controller));
    }

    public constructor(name: string, properties: ICardTargetResolver<AbilityContext>, ability: PlayerOrCardAbility = null) {
        super(name, properties, ability);

        if (this.properties.mode === TargetMode.UpTo || this.properties.mode === TargetMode.UpToVariable) {
            this.properties.canChooseNoCards = this.properties.canChooseNoCards ?? true;
        }

        if ('canChooseNoCards' in this.properties) {
            this.properties.optional = this.properties.optional || this.properties.canChooseNoCards;
        }

        this.selector = this.getSelector(properties);
        this.immediateEffect = properties.immediateEffect;

        if (this.properties.immediateEffect) {
            this.properties.immediateEffect.setDefaultTargetFn((context) => context.targets[name]);
        }

        this.validateZoneLegalForTarget(properties);
    }

    private getSelector(properties: ICardTargetResolver<AbilityContext>) {
        const cardCondition = (card: Card, context: AbilityContext) => this.checkCardCondition(card, context, properties);
        return CardSelectorFactory.create(Object.assign({}, properties, { cardCondition: cardCondition, targets: true }));
    }

    private checkCardCondition(card: Card, context: AbilityContext, properties: ICardTargetResolver<AbilityContext>) {
        try {
            const contextCopy = this.getContextCopy(card, context);
            if (context.stage === Stage.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
                return false;
            }
            return (this.immediateEffect || !this.dependentTarget || this.dependentTarget.properties.optional || this.dependentTarget.hasLegalTarget(contextCopy)) &&
              (!properties.cardCondition || properties.cardCondition(card, contextCopy)) &&
              (properties.immediateEffect == null || properties.immediateEffect.hasLegalTarget(contextCopy, {}, this.properties.mustChangeGameState));
        } catch (err) {
            // if an error happens while evaluating a card's condition, report it silently and return false so we have a chance to recover
            context.game.reportError(err, false);
            return false;
        }
    }

    private getContextCopy(card: Card, context: AbilityContext, targetMode?: TargetMode) {
        const contextCopy = context.copy();
        contextCopy.targets[this.name] = targetMode === TargetMode.Single || targetMode == null ? card : [card];
        if (this.name === 'target') {
            contextCopy.target = card;
        }
        return contextCopy;
    }

    public override hasLegalTarget(context: AbilityContext) {
        return this.selector.hasEnoughTargets(context);
    }

    public getAllLegalTargets(context: AbilityContext): Card[] {
        return this.selector.getAllLegalTargets(context);
    }

    protected override resolveInternal(context: AbilityContext, targetResults, passPrompt, player: Player) {
        const legalTargets = this.selector.getAllLegalTargets(context);
        if (legalTargets.length === 0) {
            if (context.stage === Stage.PreTarget) {
                // if there are no targets at the pretarget stage, delay targeting until after costs are paid
                targetResults.delayTargeting = this;
                return;
            }
            return;
        }

        // A player can always choose not to pick a card from a zone that is hidden from their opponents
        // if doing so would reveal hidden information(i.e. that there are one or more valid cards in that zone) (SWU Comp Rules 2.0 1.17.4)
        // TODO: test if picking a card from an opponent's usually hidden zone(e.g. opponent's hand) works as expected(the if block here should be skipped)
        const choosingFromHidden = this.isChoosingFromHidden(legalTargets, context);
        if (choosingFromHidden) {
            this.properties.optional = true;
            this.selector.optional = true;
            this.selector.appendToDefaultTitle = CardTargetResolver.choosingFromHiddenPrompt;
        }

        // if there are legal targets but this wouldn't have a gamestate-changing effect on any of them, we can just shortcut and skip selection
        // (unless there are dependent targets that might care about the targeting result)
        // also, some complex implementations(e.g. Don't Get Cocky) use a targetResolver with no immediateEffect to have the player choose a target for referencing later
        // these will appear to have no effect on any target, but should not be skipped
        if (
            !this.dependentTarget &&
            this.immediateEffect
        ) {
            let effectiveTargetFound = false;
            for (const target of legalTargets) {
                const contextWithTarget = this.getContextCopy(target, context, this.properties.mode);

                if (this.immediateEffect.hasLegalTarget(contextWithTarget, {}, GameStateChangeRequired.MustFullyOrPartiallyResolve)) {
                    effectiveTargetFound = true;
                    break;
                }
            }

            if (!effectiveTargetFound) {
                targetResults.hasEffectiveTargets = targetResults.hasEffectiveTargets || false;
                return;
            }
        }

        targetResults.hasEffectiveTargets = true;

        // if there's only one target available...
        if (context.player.autoSingleTarget && legalTargets.length === 1) {
            // ...and we are an optional resolver, prompt the player if they want to resolve
            if (this.selector.optional) {
                this.promptForSingleOptionalTarget(context, legalTargets[0], choosingFromHidden);
                return;
            }

            // ...and we are a non-optional resolver, auto-select
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
            if (targetResults.canCancel) {
                buttons.push({ text: 'Cancel', arg: 'cancel' });
            }
            if (passPrompt) {
                buttons.push({ text: passPrompt.buttonText, arg: passPrompt.arg });
                passPrompt.hasBeenShown = true;
            }
        }
        const mustSelect = legalTargets.filter((card) =>
            card.getOngoingEffectValues(EffectName.MustBeChosen).some((restriction) => restriction.isMatch('target', context))
        );

        const promptProperties: ISelectCardPromptProperties = {
            ...this.getDefaultProperties(context),
            selector: this.selector,
            buttons: buttons,
            mustSelect: mustSelect,
            isOpponentEffect: player === context.player.opponent,
            selectCardMode: this.properties.mode === TargetMode.Single ? SelectCardMode.Single : SelectCardMode.Multiple,
            onSelect: (card) => {
                this.setTargetResult(context, card);
                return true;
            },
            onCancel: () => {
                this.cancel(targetResults);
                return true;
            },
            onMenuCommand: (arg) => {
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
        };
        context.game.promptForSelect(player, Object.assign(promptProperties, extractedProperties));
    }

    private promptForSingleOptionalTarget(context: AbilityContext, target: Card, choosingFromHidden: boolean) {
        const effectName = this.properties.activePromptTitle ? this.properties.activePromptTitle : context.ability.title;

        const activePromptTitle = `Trigger the effect '${effectName}' on target '${target.title}' or pass${choosingFromHidden ? ' ' + CardTargetResolver.choosingFromHiddenPrompt : ''}`;

        context.game.promptWithHandlerMenu(context.player, {
            activePromptTitle,
            choices: [`${effectName} -> ${target.title}`, 'Pass'],
            handlers: [
                () => this.setTargetResult(context, target),
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                () => {}
            ]
        });
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
        const cards: Card[] = Helpers.asArray(context.targets[this.name]);
        return (cards.every((card) => this.selector.canTarget(card, context, [])) &&
          this.selector.hasEnoughSelected(cards, context) && !this.selector.hasExceededLimit(cards, context));
    }

    protected override hasTargetsChosenByPlayerInternal(context: AbilityContext, player: Player = context.player) {
        if (this.getChoosingPlayer(context) === player && (this.selector.optional || this.selector.hasEnoughTargets(context))) {
            return true;
        }

        return this.getAllLegalTargets(context).some((card) => {
            const contextCopy = this.getContextCopy(card, context, this.properties.mode);
            if (this.properties.immediateEffect && this.properties.immediateEffect.hasTargetsChosenByPlayer(contextCopy, player)) {
                return true;
            }
            if (this.dependentTarget) {
                return this.dependentTarget.hasTargetsChosenByPlayerInternal(contextCopy, player);
            }
            return false;
        });
    }

    /**
     * Checks whether the target's provided zone filters have at least one legal zone for the provided
     * card types. This is to catch situations in which a mismatched zone and card type was accidentally
     * provided, which would cause target resolution to always silently fail to find any legal targets.
     */
    private validateZoneLegalForTarget(properties) {
        if (!properties.zoneFilter || !properties.cardTypeFilter) {
            return;
        }

        for (const type of Array.isArray(properties.cardTypeFilter) ? properties.cardTypeFilter : [properties.cardTypeFilter]) {
            const legalZones = Helpers.defaultLegalZonesForCardTypeFilter(type);
            if (legalZones.some((zone) => EnumHelpers.cardZoneMatches(zone, properties.zoneFilter))) {
                return;
            }
        }

        Contract.fail(`Target zone filters '${properties.zoneFilter}' for ability has no overlap with legal zones for target card types '${properties.cardTypeFilter}', so target resolution is guaranteed to find no legal targets`);
    }

    private isChoosingFromHidden(legalTargets: Card[], context: AbilityContext): boolean {
        const choosingPlayer = typeof this.properties.choosingPlayer === 'function' ? this.properties.choosingPlayer(context) : this.properties.choosingPlayer;
        const zones = new Set<ZoneName>(legalTargets.map((card) => card.zoneName));
        return !(this.properties.ignoreHiddenZoneRule ?? false) &&
          (!!this.properties.cardTypeFilter || !!this.properties.cardCondition) &&
          (
              (zones.size === 0 && !!this.properties.zoneFilter && CardTargetResolver.allZonesAreHidden(this.properties.zoneFilter, choosingPlayer)) ||
              CardTargetResolver.allZonesAreHidden([...zones], choosingPlayer)
          );
    }
}
