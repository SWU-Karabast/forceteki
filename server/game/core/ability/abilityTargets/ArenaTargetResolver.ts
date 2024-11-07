import { TargetResolver } from './TargetResolver';
import { IArenaTargetResolver } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import type Player from '../../Player';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { Location } from '../../Constants';
import { isArray } from 'underscore';
import { isArena } from '../../utils/EnumHelpers';

export class ArenaTargetResolver extends TargetResolver<IArenaTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: IArenaTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);

        if (this.properties.immediateEffect) {
            this.properties.immediateEffect.setDefaultTargetFn((context) => context.targets[name]);
        }
    }

    protected override hasLegalTarget(context: any): boolean {
        return true;
    }

    protected override hasTargetsChosenByInitiatingPlayer(context: AbilityContext): boolean {
        return this.getChoosingPlayer(context) === context.player;
    }

    protected override checkTarget(context: AbilityContext): boolean {
        if (!context.targets[this.name]) {
            return false;
        }
        if (isArray(context.targets[this.name])) {
            return context.targets[this.name].every((target) => isArena(target));
        }
        return isArena(context.targets[this.name]);
    }

    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player) {
        const promptProperties = this.getDefaultProperties(context);

        const activePromptTitle = this.properties.activePromptTitle || 'Choose an arena';
        const choices = ['Ground', 'Space'];
        const handlers = [Location.GroundArena, Location.SpaceArena].map(
            (chosenArena) => {
                return () => {
                    this.setTargetResult(context, chosenArena);
                };
            }
        );

        Object.assign(promptProperties, { activePromptTitle, choices, handlers });

        context.game.promptWithHandlerMenu(player, promptProperties);
    }
}