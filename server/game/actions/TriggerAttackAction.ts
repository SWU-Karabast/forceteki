import type { AbilityContext } from '../core/ability/AbilityContext.js';
import BaseAction from '../core/ability/PlayerAction.js';
import { EffectName, EventName, Location, PhaseName, PlayType, TargetMode, WildcardLocation } from '../core/Constants.js';
import { isArena } from '../core/utils/EnumHelpers.js';
import { exhaustSelf } from '../costs/CostLibrary.js';
import { attack } from '../gameSystems/GameSystemLibrary.js';
import type Player from '../core/Player.js';
import Card from '../core/card/Card.js';

export class TriggerAttackAction extends BaseAction {
    public title = 'Attack';

    // TODO: rename to "gameSystem" or "triggeredSystem" or something and centralize where it is created, since it's also emitted from executeHandler
    public constructor(card: Card) {
        super(card, [exhaustSelf()], { 
            gameSystem: attack({ attacker: card }),
            mode: TargetMode.AutoSingle,
            location: WildcardLocation.AnyAttackable,
            activePromptTitle: 'Choose a target for attack'
        });
    }

    public override meetsRequirements(context = this.createContext(), ignoredRequirements: string[] = []): string {
        if (
            context.game.currentPhase !== PhaseName.Action &&
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
    public override executeHandler(context: AbilityContext): void {
        context.game.openEventWindow([
            attack({
                attacker: context.source
            }).getEvent(context.target, context)
        ]);
    }
}
