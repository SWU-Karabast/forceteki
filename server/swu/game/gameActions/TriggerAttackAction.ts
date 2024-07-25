import type { AbilityContext } from '../AbilityContext.js';
import BaseAction from '../BaseAction.js';
import { EffectNames, EventNames, Locations, Phases, PlayTypes, isArena } from '../Constants.js';
import { exhaustSelf } from '../costs/Costs.js';
import { attack } from './GameActions.js';
import type DeckCard from '../card/deckcard.js';
import type Player from '../player.js';

type ExecutionContext = AbilityContext & { onPlayCardSource: any };

export class TriggerAttackAction extends BaseAction {
    public title = 'Attack';

    // TODO: rename to "gameSystem" or "triggeredSystem" or something and centralize where it is created, since it's also emitted from executeHandler
    public constructor(card: DeckCard) {
        super(card, [exhaustSelf()], {
            gameAction: attack({
                attacker: card
            })
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
    public executeHandler(context: ExecutionContext): void {
        context.game.openEventWindow([
            attack({
                attacker: context.source
            }).getEvent(context.source, context)
        ]);
    }
}
