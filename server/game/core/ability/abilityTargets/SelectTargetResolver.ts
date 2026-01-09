import type { ISelectTargetResolver, ISelectUnlessTargetResolver, IChoicesInterface } from '../../../TargetInterfaces';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import type { AbilityContext } from '../AbilityContext';
import type { ITargetResult } from './TargetResolver';
import { TargetResolver } from './TargetResolver';
import type { GameSystem } from '../../gameSystem/GameSystem';
import { SelectChoice } from './SelectChoice';
import { GameStateChangeRequired, Stage, TargetMode } from '../../Constants';
import type { Player } from '../../Player';
import type { IPassAbilityHandler } from '../../gameSteps/AbilityResolver';
import * as Helpers from '../../utils/Helpers';

/** Target resolver for selecting between multiple prompted choices due to an effect */
export class SelectTargetResolver extends TargetResolver<ISelectTargetResolver<AbilityContext> | ISelectUnlessTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: ISelectTargetResolver<AbilityContext> | ISelectUnlessTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);
    }

    public override hasLegalTarget(context: AbilityContext): boolean {
        const keys = Object.keys(this.getChoices(context));
        return keys.some((key) => this.isChoiceLegal(key, context));
    }

    private getChoices(context: AbilityContext): IChoicesInterface {
        switch (this.properties.mode) {
            case TargetMode.Select:
                return typeof this.properties.choices === 'function'
                    ? this.properties.choices(context)
                    : this.properties.choices;
            case TargetMode.SelectUnless:
                return this.buildSelectUnlessChoices(context);
        }
    }

    private buildSelectUnlessChoices(context: AbilityContext): IChoicesInterface {
        // Type assertion is safe - this method is only called from the SelectUnless case in getChoices
        const { defaultEffect, unlessEffect } = this.properties as ISelectUnlessTargetResolver<AbilityContext>;

        return {
            [defaultEffect.promptButtonText]: this.resolveSelectUnlessEffect(defaultEffect.effect, context),
            [unlessEffect.promptButtonText]: this.resolveSelectUnlessEffect(unlessEffect.effect, context)
        };
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
            const { unlessEffect, defaultEffect } = this.properties;
            const unlessGameSystem = this.resolveSelectUnlessEffect(unlessEffect.effect, context);

            if (!unlessGameSystem.hasLegalTarget(context, null, GameStateChangeRequired.MustFullyOrPartiallyResolve)) {
                // unlessEffect cannot be resolved, automatically apply defaultEffect
                this.setTargetResult(context, defaultEffect.promptButtonText);
                return;
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

    public override checkTarget(context: AbilityContext): boolean {
        if (!context.selects[this.name]) {
            return false;
        }

        return this.properties.showUnresolvable || this.isChoiceLegal(context.selects[this.name].choice, context);
    }

    protected override hasTargetsChosenByPlayerInternal(context: AbilityContext, player: Player = context.player) {
        const actions = Object.values(this.getChoices(context)).filter((value) => typeof value !== 'function');
        return actions.some((action) => action.hasTargetsChosenByPlayer(context, player));
    }
}