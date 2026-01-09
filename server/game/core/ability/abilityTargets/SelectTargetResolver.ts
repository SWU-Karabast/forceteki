import type { ISelectTargetResolver, IChoicesInterface } from '../../../TargetInterfaces';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import type { AbilityContext } from '../AbilityContext';
import type { ITargetResult } from './TargetResolver';
import { TargetResolver } from './TargetResolver';
import type { GameSystem } from '../../gameSystem/GameSystem';
import { SelectChoice } from './SelectChoice';
import { Stage, TargetMode } from '../../Constants';
import type { Player } from '../../Player';
import type { IPassAbilityHandler } from '../../gameSteps/AbilityResolver';
import * as Helpers from '../../utils/Helpers';
import * as Contract from '../../utils/Contract';

/** Target resolver for selecting between multiple prompted choices due to an effect */
export class SelectTargetResolver extends TargetResolver<ISelectTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: ISelectTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);

        // Validate that SelectUnless mode has the required properties
        if (properties.mode === TargetMode.SelectUnless) {
            Contract.assertNotNullLike(properties.unlessEffect, 'SelectUnless mode requires unlessEffect to be specified');
            Contract.assertNotNullLike(properties.defaultEffect, 'SelectUnless mode requires defaultEffect to be specified');
        }

        // Validate that Select mode has the required choices property
        if (properties.mode === TargetMode.Select) {
            Contract.assertNotNullLike(properties.choices, 'Select mode requires choices to be specified');
        }
    }

    public override hasLegalTarget(context: AbilityContext): boolean {
        const keys = Object.keys(this.getChoices(context));
        return keys.some((key) => this.isChoiceLegal(key, context));
    }

    private getChoices(context: AbilityContext): IChoicesInterface {
        // For SelectUnless mode, generate choices from unlessEffect and defaultEffect
        if (this.properties.mode === TargetMode.SelectUnless) {
            return this.buildSelectUnlessChoices(context);
        }

        if (typeof this.properties.choices === 'function') {
            return this.properties.choices(context);
        }
        return this.properties.choices;
    }

    private buildSelectUnlessChoices(context: AbilityContext): IChoicesInterface {
        const choices: IChoicesInterface = {};

        const defaultEffect = this.properties.defaultEffect;
        const unlessEffect = this.properties.unlessEffect;

        choices[defaultEffect.promptButton] = this.resolveSelectUnlessEffect(defaultEffect.effect, context);
        choices[unlessEffect.promptButton] = this.resolveSelectUnlessEffect(unlessEffect.effect, context);

        return choices;
    }

    private resolveSelectUnlessEffect(effect: GameSystem<AbilityContext> | ((context: AbilityContext) => GameSystem<AbilityContext>), context: AbilityContext): GameSystem<AbilityContext> {
        return typeof effect === 'function' ? effect(context) : effect;
    }

    private isChoiceLegal(key: string, context: AbilityContext) {
        const contextCopy = context.copy();
        this.setTargetResult(contextCopy, key);
        if (context.stage === Stage.PreTarget && this.dependentCost && !this.dependentCost.canPay(contextCopy)) {
            return false;
        }
        if (this.dependentTarget && !this.dependentTarget.hasLegalTarget(contextCopy)) {
            return false;
        }
        const choice = this.getChoices(context)[key];
        return choice.hasLegalTarget(contextCopy);
    }

    protected override setTargetResult(context, choice) {
        context.selects[this.name] = new SelectChoice(choice);
        if (this.name === 'target') {
            context.select = choice;
        }
    }

    public override getGameSystems(context: AbilityContext): GameSystem | GameSystem[] {
        if (!context.selects[this.name]) {
            return [];
        }

        // Handle the default effect case (auto-resolved when unless effect is illegal)
        if (context.selects[this.name].choice === '__default__') {
            const defaultEffect = this.getDefaultEffect(context);
            return defaultEffect ? defaultEffect : [];
        }

        const choice = this.getChoices(context)[context.selects[this.name].choice];
        if (typeof choice !== 'function') {
            return choice;
        }
        return [];
    }

    protected override resolveInternal(player: Player, context: AbilityContext, targetResults: ITargetResult, passPrompt?: IPassAbilityHandler) {
        // For SelectUnless mode, check if unlessEffect can be resolved
        // If not, automatically resolve defaultEffect without prompting
        if (this.properties.mode === TargetMode.SelectUnless) {
            const unlessEffect = this.getUnlessEffect(context);
            if (unlessEffect && !unlessEffect.hasLegalTarget(context)) {
                // unlessEffect cannot be resolved, automatically apply defaultEffect
                const defaultEffect = this.getDefaultEffect(context);
                if (defaultEffect) {
                    context.selects[this.name] = new SelectChoice('__default__');
                    return;
                }
            }
        }

        const choices = Object.keys(this.getChoices(context));
        let legalChoices = choices.filter((key) => this.isChoiceLegal(key, context));

        if (legalChoices.length === 0) {
            return;
        }

        if (this.properties.showUnresolvable) {
            legalChoices = choices;
        }

        const handlers = legalChoices.map((choice) => {
            return () => {
                this.setTargetResult(context, choice);
            };
        });

        if (passPrompt) {
            choices.push(passPrompt.buttonText);
            handlers.push(passPrompt.handler);
            passPrompt.hasBeenShown = true;
        }

        // TODO: figure out if we need these buttons
        /* if (player !== context.player.opponent && context.stage === Stage.PreTarget) {
            if (!targetResults.noCostsFirstButton) {
                choices.push('Pay costs first');
                handlers.push(() => (targetResults.payCostsFirst = true));
            }
            choices.push('Cancel');
            handlers.push(() => (targetResults.cancelled = true));
        }*/

        if (handlers.length === 1) {
            handlers[0]();
        } else if (handlers.length > 1) {
            const baseProperties = this.getDefaultProperties(context);
            const activePromptTitleConcrete = (baseProperties.activePromptTitle && typeof baseProperties.activePromptTitle === 'function') ? (baseProperties.activePromptTitle as (context: AbilityContext) => string)(context) : baseProperties.activePromptTitle || 'Select one';
            const selectedCards = Helpers.asArray(
                typeof this.properties.highlightCards === 'function'
                    ? this.properties.highlightCards(context)
                    : this.properties.highlightCards
            );

            const promptProperties = Object.assign(baseProperties, {
                activePromptTitle: activePromptTitleConcrete,
                choices: legalChoices,
                handlers,
                selectedCards,
            });
            context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    private getUnlessEffect(context: AbilityContext): GameSystem | null {
        if (!this.properties.unlessEffect) {
            return null;
        }
        return this.resolveSelectUnlessEffect(this.properties.unlessEffect.effect, context);
    }

    private getDefaultEffect(context: AbilityContext): GameSystem | null {
        if (!this.properties.defaultEffect) {
            return null;
        }
        return this.resolveSelectUnlessEffect(this.properties.defaultEffect.effect, context);
    }

    public override checkTarget(context: AbilityContext): boolean {
        if (!context.selects[this.name]) {
            return false;
        }

        // Allow __default__ choice to pass validation
        if (context.selects[this.name].choice === '__default__') {
            return true;
        }

        return this.properties.showUnresolvable || this.isChoiceLegal(context.selects[this.name].choice, context);
    }

    protected override hasTargetsChosenByPlayerInternal(context: AbilityContext, player: Player = context.player) {
        const actions = Object.values(this.getChoices(context)).filter((value) => typeof value !== 'function');
        return actions.some((action) => action.hasTargetsChosenByPlayer(context, player));
    }
}