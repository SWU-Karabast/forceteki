import { TargetResolver } from './TargetResolver';
import { IPlayerTargetResolver } from '../../../TargetInterfaces';
import { AbilityContext } from '../AbilityContext';
import type Player from '../../Player';
import PlayerOrCardAbility from '../PlayerOrCardAbility';
import { Stage } from '../../Constants';

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
        return context.targets[this.name] && context.game.getPlayers().includes(context.targets[this.name]);
    }

    protected override getAllLegalTargets(context: AbilityContext): Player[] {
        // Placeholder.
        return context.game.getPlayers();
    }

    protected override resolve(context: AbilityContext, targetResults, passPrompt = null) {
        if (!super.resolve(context, targetResults, passPrompt)) {
            return false;
        }

        const player = context.choosingPlayerOverride || this.getChoosingPlayer(context);
        const promptTitle = this.properties.activePromptTitle || 'Choose a player';
        const choices = ['You', 'Opponent'];
        const handlers = [player, player.opponent].map(
            (chosenPlayer) => {
                return () => {
                    context.targets[this.name] = chosenPlayer;
                    if (this.name === 'target') {
                        context.target = chosenPlayer;
                    }
                };
            }
        );
        if (player !== context.player.opponent && context.stage === Stage.PreTarget) {
            if (!targetResults.noCostsFirstButton) {
                choices.push('Pay costs first');
                handlers.push(() => (targetResults.payCostsFirst = true));
            }
            choices.push('Cancel');
            handlers.push(() => (targetResults.cancelled = true));
        }
        if (handlers.length > 1) {
            let waitingPromptTitle = '';
            if (context.stage === Stage.PreTarget) {
                if (context.ability.type === 'action') {
                    waitingPromptTitle = 'Waiting for opponent to take an action or pass';
                } else {
                    waitingPromptTitle = 'Waiting for opponent';
                }
            }
            context.game.promptWithHandlerMenu(player, {
                waitingPromptTitle: waitingPromptTitle,
                activePromptTitle: promptTitle,
                context: context,
                source: context.source,
                choices: choices,
                handlers: handlers
            });
        }
        return true;
    }
}