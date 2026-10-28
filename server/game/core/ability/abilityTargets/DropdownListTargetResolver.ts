import type { IDropdownListTargetResolver } from '../../../TargetInterfaces';
import type { PlayerOrCardAbility } from '../PlayerOrCardAbility';
import type { AbilityContext } from '../AbilityContext';
import { TargetResolver } from './TargetResolver';
import { SelectChoice } from './SelectChoice';
import type { Player } from '../../Player';
import { Helpers } from '../../utils/Helpers';
import { EventName } from '../../Constants';

/** Target resolver for selecting from a list of strings and passing the choice to a GameSystem */
export class DropdownListTargetResolver extends TargetResolver<IDropdownListTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: IDropdownListTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);
    }

    public override canResolve(context) {
        return super.canResolve(context) && (!this.properties.condition || this.properties.condition(context));
    }

    public override hasLegalTarget(context: AbilityContext): boolean {
        const gameSystems = Helpers.asArray(this.getGameSystems(context));
        // If there's no selection yet, we consider there to be a legal target
        // since the game system usually depends on the selection
        return !context.select ||
          gameSystems.length === 0 ||
          gameSystems.some((gameSystem) => gameSystem.hasLegalTarget(context));
    }

    protected override resolveInternal(player: Player, context: AbilityContext) {
        const options = typeof this.properties.options === 'function' ? this.properties.options(context) : this.properties.options;
        if (options.length === 0) {
            return;
        }

        // A single option is a decision-free menu choice, so we always auto-resolve it regardless of the
        // player's autoSingleTarget setting (which only governs single *card* target selection, not text menus).
        if (options.length === 1) {
            this.setTargetResult(context, options[0]);
        } else {
            const choiceHandler = (choice: string) => this.setTargetResult(context, choice);
            const activePromptTitleConcrete = typeof this.properties.activePromptTitle === 'function' ? this.properties.activePromptTitle(context) : this.properties.activePromptTitle;
            const promptProperties = Object.assign(this.getDefaultProperties(context), { choiceHandler, options, activePromptTitle: activePromptTitleConcrete });

            context.game.promptWithDropdownListMenu(player, promptProperties);
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

        this.emitCardNamed(context, choice, abilitySource);
    }

    /**
     * Pure-log SWU-PGN/1.0 hook (§10.2 NAME): a player named something. `namesCard` is true only
     * when the list offered was card titles (the other dropdowns name a trait). Fully wrapped:
     * recording instrumentation must never affect gameplay.
     */
    private emitCardNamed(context: AbilityContext, choice: string, source: unknown) {
        try {
            const options = this.properties.options;
            const namesCard = options === context.game.playableCardTitles || options === context.game.allNonLeaderCardTitles;
            context.game.emit(EventName.OnCardNamed, { player: context.player, choice, source, namesCard });
        } catch {
            // never let recording instrumentation break targeting
        }
    }

    public override checkTarget(context: AbilityContext): boolean {
        return !!context.selects[this.name];
    }

    protected override hasTargetsChosenByPlayerInternal(context: AbilityContext, player: Player = context.player) {
        return this.getChoosingPlayer(context) === player;
    }
}
