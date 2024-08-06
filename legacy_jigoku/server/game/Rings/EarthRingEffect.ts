import { GameModes } from '../../GameModes';
import { TargetModes } from '../Constants';
import { AbilityContext } from '../AbilityContext';
import BaseAbility = require('../baseability');

const DRAW = 'Draw a card';
const FORCE_DISCARD = 'Opponent discards a card';
const DRAW_AND_FORCE_DISCARD = 'Draw a card and opponent discards';
const SKIP = "Don't resolve";

function choices(optional: boolean, gameMode: GameModes) {
    switch (gameMode) {
        case GameModes.Skirmish:
            return {
                [DRAW]: () => true,
                [FORCE_DISCARD]: (context) => context.player.opponent,
                [SKIP]: () => optional
            };
        default:
            return {
                [DRAW_AND_FORCE_DISCARD]: () => true,
                [SKIP]: () => optional
            };
    }
}

export class EarthRingEffect extends BaseAbility {
    public title = 'Earth Ring Effect';
    public cannotTargetFirst = true;
    public defaultPriority = 1; // Default resolution priority when players have ordering switched off

    public constructor(
        optional: boolean,
        gameMode: GameModes,
        private onResolution = (resolved: boolean) => {}
    ) {
        super({
            target: {
                mode: TargetModes.Select,
                activePromptTitle: 'Choose an effect to resolve',
                source: 'Earth Ring',
                choices: choices(optional, gameMode)
            }
        });
    }

    public executeHandler(context: AbilityContext): void {
        if (context.select === SKIP) {
            context.game.addMessage('{0} chooses not to resolve the {1} ring', context.player, 'earth');
            this.onResolution(false);
        } else if (context.select === FORCE_DISCARD) {
            context.game.addMessage(
                '{0} resolves the {1} ring, forcing {2} to discard a card at random',
                context.player,
                'earth',
                context.player.opponent
            );
            this.onResolution(true);
            context.game.actions.discardAtRandom().resolve(context.player.opponent, context);
        } else if (context.select === DRAW_AND_FORCE_DISCARD && context.player.opponent) {
            context.game.addMessage(
                '{0} resolves the {1} ring, drawing a card and forcing {2} to discard a card at random',
                context.player,
                'earth',
                context.player.opponent
            );
            this.onResolution(true);
            context.game.applyGameAction(context, { draw: context.player, discardAtRandom: context.player.opponent });
        } else if (context.select === DRAW) {
            context.game.addMessage('{0} resolves the {1} ring, drawing a card', context.player, 'earth');
            this.onResolution(true);
            context.game.applyGameAction(context, { draw: context.player });
        }
    }
}