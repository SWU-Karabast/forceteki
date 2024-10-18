import { ISelectStringTargetResolver } from '../../../TargetInterfaces';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { AbilityContext } from '../AbilityContext';
import { TargetResolver } from './TargetResolver';
import { SelectChoice } from './SelectChoice';
import type Player from '../../Player';
import * as Helpers from '../../utils/Helpers';

/** Target resolver for selecting from a list of strings and passing the choice to a GameSystem */
export class SelectStringTargetResolver extends TargetResolver<ISelectStringTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: ISelectStringTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);
    }

    protected override canResolve(context) {
        return super.canResolve(context) && (!this.properties.condition || this.properties.condition(context));
    }

    protected override hasLegalTarget(context: AbilityContext): boolean {
        const gameSystems = Helpers.asArray(this.getGameSystems(context));
        return gameSystems.length === 0 || gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    protected override getAllLegalTargets() {
        return [];
    }

    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player) {
        const options = this.properties.options;
        if (options.length === 0) {
            return;
        }

        const choiceHandler = (choice: string) => this.setTargetResult(context, choice);

        const promptProperties = Object.assign(this.getDefaultProperties(context), { choiceHandler, options });

        if (options.length === 1) {
            this.setTargetResult(context, options[0]);
        } else {
            context.game.promptWithSelectFromListMenu(player, promptProperties);
        }
    }

    protected override setTargetResult(context, choice) {
        context.selects[this.name] = new SelectChoice(choice);
        if (this.name === 'target') {
            context.select = choice;
        }
    }

    protected override checkTarget(context: AbilityContext): boolean {
        return !!context.selects[this.name];
    }

    protected override hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        return true;
    }
}
