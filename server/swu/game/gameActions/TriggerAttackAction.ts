import type { AbilityContext } from '../AbilityContext.js';
import BaseAction from '../BaseAction.js';
import { EffectNames, EventNames, Locations, Phases, PlayTypes, TargetModes, isArena } from '../Constants.js';
import { exhaustSelf } from '../costs/Costs.js';
import { attack } from './GameActions.js';
import type Player from '../player.js';
import BaseCard from '../card/basecard.js';

export class TriggerAttackAction extends BaseAction {
    public title = 'Attack';

    // TODO: rename to "gameSystem" or "triggeredSystem" or something and centralize where it is created, since it's also emitted from executeHandler
    public constructor(card: BaseCard) {
        super(card, [exhaustSelf()], { 
            gameAction: attack({ attacker: card }),
            mode: TargetModes.AutoSingle,
            activePromptTitle: 'Choose a target for attack'
        });
    }

    public meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.game.currentPhase !== Phases.Action &&
            !ignoredRequirements.includes('phase')
        ) {
            return 'phase';
        }
        if (
            !isArena(context.source.location) &&
            !ignoredRequirements.includes('location')
        ) {
            return 'location';
        }
        // TODO: rename checkRestrictions to be clearer what the return value means
        if (!context.player.checkRestrictions('cannotAttack', context)) {
            return 'restriction';
        }
        return super.meetsRequirements(context);
    }

    // attack triggers as an event instead of a game step because it's part of the same action
    public executeHandler(context: AbilityContext): void {
        context.game.openEventWindow([
            attack({
                attacker: context.source
            }).getEvent(context.target, context)
        ]);
    }
}
