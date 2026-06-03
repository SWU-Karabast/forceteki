import type { INumberTargetResolver } from '../../../TargetInterfaces';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import type { AbilityContext } from '../AbilityContext';
import { TargetResolver } from './TargetResolver';
import { SelectChoice } from './SelectChoice';
import type { Player } from '../../Player';
import { Helpers } from '../../utils/Helpers';
import { Contract } from '../../utils/Contract';

/** Target resolver for selecting an integer from a bounded range. */
export class NumberTargetResolver extends TargetResolver<INumberTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: INumberTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);
    }

    public override canResolve(context) {
        return super.canResolve(context) && (!this.properties.condition || this.properties.condition(context));
    }

    public override hasLegalTarget(context: AbilityContext): boolean {
        const gameSystems = Helpers.asArray(this.getGameSystems(context));
        return !context.select ||
          gameSystems.length === 0 ||
          gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    protected override resolveInternal(player: Player, context: AbilityContext) {
        const min = this.getValue(this.properties.min, context);
        const max = this.getValue(this.properties.max, context);

        Contract.assertTrue(max >= min, `NumberTargetResolver requires max to be greater than or equal to min, instead received min=${min} max=${max}`);

        if (max === min) {
            this.setTargetResult(context, min.toString());
        } else {
            const choiceHandler = (choice: string) => this.setTargetResult(context, choice);
            const activePromptTitleConcrete = typeof this.properties.activePromptTitle === 'function' ? this.properties.activePromptTitle(context) : this.properties.activePromptTitle;
            const promptProperties = Object.assign(this.getDefaultProperties(context), { choiceHandler, min, max, activePromptTitle: activePromptTitleConcrete });

            context.game.promptWithNumberMenu(player, promptProperties);
        }
    }

    protected override setTargetResult(context, choice) {
        context.selects[this.name] = new SelectChoice(choice);
        if (this.name === 'target') {
            context.select = choice;
        }
        const abilitySource = context.ability.gainAbilitySource != null ? context.ability.gainAbilitySource : context.source;

        if (this.properties.logSelection ?? true) {
            context.game.addMessage('{0} names {1} using {2}', context.player, choice, abilitySource);
        }
    }

    public override checkTarget(context: AbilityContext): boolean {
        return !!context.selects[this.name];
    }

    protected override hasTargetsChosenByPlayerInternal(context: AbilityContext, player: Player = context.player) {
        return this.getChoosingPlayer(context) === player;
    }

    private getValue(value: number | ((context: AbilityContext) => number), context: AbilityContext): number {
        const concreteValue = typeof value === 'function' ? value(context) : value;
        Contract.assertTrue(Number.isInteger(concreteValue), `NumberTargetResolver value must be an integer, instead received ${concreteValue}`);
        return concreteValue;
    }
}
