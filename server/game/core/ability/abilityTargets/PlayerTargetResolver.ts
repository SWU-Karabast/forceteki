import { TargetResolver } from './TargetResolver';
import type { IPlayerTargetResolver } from '../../../TargetInterfaces';
import type { AbilityContext } from '../AbilityContext';
import type Player from '../../Player';
import type PlayerOrCardAbility from '../PlayerOrCardAbility';
import { TargetMode } from '../../Constants';
import * as Contract from '../../utils/Contract';
import { isArray } from 'underscore';

// This currently assumes that every player will always be a legal target for any effect it's given.
// TODO: Make a PlayerSelector class(see the use of property "selector" in CardTargetResolver) to help determine target legality. Use it to replace placeholder override functions below.
export class PlayerTargetResolver extends TargetResolver<IPlayerTargetResolver<AbilityContext>> {
    public constructor(name: string, properties: IPlayerTargetResolver<AbilityContext>, ability: PlayerOrCardAbility) {
        super(name, properties, ability);

        if (this.properties.immediateEffect) {
            this.properties.immediateEffect.setDefaultTargetFn((context) => context.targets[name]);
        }
    }

    protected override hasLegalTarget(context: any): boolean {
        // Placeholder.
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
            return context.targets[this.name].every((target) => context.game.getPlayers().includes(target));
        }
        return context.game.getPlayers().includes(context.targets[this.name]);
    }

    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player) {
        const promptProperties = this.getDefaultProperties(context);

        const choices = ['You', 'Opponent'];

        if (this.properties.mode === TargetMode.MultiplePlayers) { // Uses a HandlerMenuMultipleSelectionPrompt: handler takes an array of chosen items
            const activePromptTitle = promptProperties.activePromptTitle || 'Choose any number of players';
            const multiSelect = true;
            const handler = (chosen) => {
                chosen = chosen.map((choiceTitle) => {
                    switch (choiceTitle) {
                        case 'You':
                            return player;
                        case 'Opponent':
                            return player.opponent;
                        default:
                            Contract.fail('Player other than "You" or "Opponent" chosen');
                    }
                });
                this.setTargetResult(context, chosen);
                return true;
            };

            Object.assign(promptProperties, { activePromptTitle, choices, multiSelect, handler });
        } else { // Uses a HandlerMenuPrompt: each choice gets its own handler, called right away when that choice is clicked
            const activePromptTitle = this.properties.activePromptTitle || 'Choose a player';
            const handlers = [player, player.opponent].map(
                (chosenPlayer) => {
                    return () => {
                        this.setTargetResult(context, chosenPlayer);
                    };
                }
            );

            Object.assign(promptProperties, { activePromptTitle, choices, handlers });
            // TODO: figure out if we need these buttons
            /* if (player !== context.player.opponent && context.stage === Stage.PreTarget) {
                if (!targetResults.noCostsFirstButton) {
                    choices.push('Pay costs first');
                    handlers.push(() => (targetResults.payCostsFirst = true));
                }
                choices.push('Cancel');
                handlers.push(() => (targetResults.cancelled = true));
            }*/
        }
        context.game.promptWithHandlerMenu(player, promptProperties);
    }
}