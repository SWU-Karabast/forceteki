import { GameModes } from '../../GameModes.js';
import { TargetModes } from '../Constants.js';
import { CalculateHonorLimit } from '../GameActions/Shared/HonorLogic.js';
import { AbilityContext } from '../AbilityContext.js';
import BaseAbility = require('../baseability.js');

const GAIN_2 = 'Gain 2 Honor';
const TAKE_1 = 'Take 1 Honor from opponent';
const SKIP = "Don't resolve";

function choices(optional: boolean, gameMode: GameModes) {
    switch (gameMode) {
        case GameModes.Skirmish:
            return {
                [TAKE_1]: (context: AbilityContext) =>
                    context.player.opponent && context.player.opponent.checkRestrictions('takeHonor', context),
                [SKIP]: () => optional
            };
        default:
            return {
                [GAIN_2]: () => true,
                [TAKE_1]: (context: AbilityContext) =>
                    context.player.opponent && context.player.opponent.checkRestrictions('takeHonor', context),
                [SKIP]: () => optional
            };
    }
}

export class AirRingEffect extends BaseAbility {
    public title = 'Air Ring Effect';
    public cannotTargetFirst = true;
    public defaultPriority = 5; // Default resolution priority when players have ordering switched off

    public constructor(
        optional: boolean,
        gameMode: GameModes,
        private onResolution = (resolved: boolean) => {}
    ) {
        super({
            target: {
                mode: TargetModes.Select,
                activePromptTitle: 'Choose an effect to resolve',
                source: 'Air Ring',
                choices: choices(optional, gameMode)
            }
        });
    }

    public executeHandler(context: AbilityContext): void {
        if (context.select === GAIN_2) {
            let [, amountToTransfer] = CalculateHonorLimit(
                context.player,
                context.game.roundNumber,
                context.game.currentPhase,
                2
            );
            context.game.addMessage(
                '{0} resolves the {1} ring, gaining {2} honor',
                context.player,
                'air',
                amountToTransfer
            );
            this.onResolution(true);
            return context.game.actions.gainHonor({ amount: 2 }).resolve(context.player, context);
        }
        if (context.select === TAKE_1) {
            context.game.addMessage(
                '{0} resolves the {1} ring, taking 1 honor from {2}',
                context.player,
                'air',
                context.player.opponent
            );
            this.onResolution(true);
            return context.game.actions.takeHonor().resolve(context.player.opponent, context);
        }
        if (!context.game.currentConflict || context.game.currentConflict.element === 'air') {
            context.game.addMessage(
                '{0} chooses not to resolve the {1} ring',
                context.player,
                context.game.currentConflict ? 'air' : context.game.currentConflict.element
            );
            this.onResolution(false);
        }
    }
}