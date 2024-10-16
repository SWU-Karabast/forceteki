import { TargetResolver } from './TargetResolver';
import { IPlayerTargetResolver } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import type Player from '../../Player';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { Stage, TargetMode } from '../../Constants';
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

    protected override getAllLegalTargets(context: AbilityContext): Player[] {
        // Placeholder.
        return context.game.getPlayers();
    }

    protected override resolveInner(context: AbilityContext, targetResults, passPrompt, player: Player, promptProperties) {
        promptProperties.choices = ['You', 'Opponent'];

        if (this.properties.mode === TargetMode.MultiplePlayers) { // Uses a HandlerMenuMultipleSelectionPrompt: handler takes an array of chosen items
            promptProperties.activePromptTitle = promptProperties.activePromptTitle || 'Choose any number of players';
            promptProperties.multiSelect = true;
            promptProperties.handler = (chosen) => {
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
                context.targets[this.name] = chosen;
                if (this.name === 'target') {
                    context.target = chosen;
                }
                return true;
            };
        } else { // Uses a HandlerMenuPrompt: each choice gets its own handler, called right away when that choice is clicked
            promptProperties.activePromptTitle = this.properties.activePromptTitle || 'Choose a player';
            promptProperties.handlers = [player, player.opponent].map(
                (chosenPlayer) => {
                    return () => {
                        context.targets[this.name] = chosenPlayer;
                        if (this.name === 'target') {
                            context.target = chosenPlayer;
                        }
                    };
                }
            );

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