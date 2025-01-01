import type { ISelectTargetResolver, IChoicesInterface } from '../../../TargetInterfaces';
import type PlayerOrCardAbility from '../PlayerOrCardAbility';
import type { AbilityContext } from '../AbilityContext';
import { TargetResolver } from './TargetResolver';
import type { GameSystem } from '../../gameSystem/GameSystem';
import { SelectChoice } from './SelectChoice';
import { Stage } from '../../Constants';
import type Player from '../../Player';

/** Target resolver for selecting between multiple prompted choices due to an effect */
export class SelectTargetResolver extends TargetResolver<ISelectTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: ISelectTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);
    }

    protected override hasLegalTarget(context: AbilityContext): boolean {
        const keys = Object.keys(this.getChoices(context));
        return keys.some((key) => this.isChoiceLegal(key, context));
    }

    private getChoices(context: AbilityContext): IChoicesInterface {
        if (typeof this.properties.choices === 'function') {
            return this.properties.choices(context);
        }
        return this.properties.choices;
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
        if (typeof choice === 'function') {
            return choice(contextCopy);
        }
        return choice.hasLegalTarget(contextCopy);
    }

    protected override setTargetResult(context, choice) {
        context.selects[this.name] = new SelectChoice(choice);
        if (this.name === 'target') {
            context.select = choice;
        }
    }

    protected override getGameSystems(context: AbilityContext): GameSystem | GameSystem[] {
        if (!context.selects[this.name]) {
            return [];
        }
        const choice = this.getChoices(context)[context.selects[this.name].choice];
        if (typeof choice !== 'function') {
            return choice;
        }
        return [];
    }

    // TODO: add passHandler here so that player can potentially be prompted for pass earlier in the window
    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player) {
        const choices = Object.keys(this.getChoices(context)).filter((key) => this.isChoiceLegal(key, context));
        const handlers = choices.map((choice) => {
            return () => {
                this.setTargetResult(context, choice);
            };
        });

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
            const promptProperties = Object.assign(baseProperties, {
                activePromptTitle: baseProperties.activePromptTitle || 'Select one',
                choices,
                handlers
            });
            context.game.promptWithHandlerMenu(player, promptProperties);
        }
    }

    protected override checkTarget(context: AbilityContext): boolean {
        return !!context.selects[this.name] && this.isChoiceLegal(context.selects[this.name].choice, context);
    }

    protected override hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        const actions = Object.values(this.getChoices(context)).filter((value) => typeof value !== 'function');
        return actions.some((action) => action.hasTargetsChosenByInitiatingPlayer(context));
    }
}