import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import { TargetMode } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { AggregateSystem } from '../core/gameSystem/AggregateSystem';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import * as Contract from '../core/utils/Contract';
import * as Helpers from '../core/utils/Helpers';

export interface ISelectPlayerProperties<TContext extends AbilityContext = AbilityContext> extends IPlayerTargetSystemProperties {
    innerSystem: PlayerTargetSystem<TContext> | AggregateSystem<TContext>;
    activePromptTitle?: string;
    mode?: TargetMode.Player | TargetMode.MultiplePlayers;
    name?: string;
}

export class SelectPlayerSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ISelectPlayerProperties> {
    public override readonly name: string = 'selectPlayer';
    public override readonly effectDescription: string = 'choose a player';
    protected override readonly eventName: MetaEventName.SelectPlayer;
    protected override readonly defaultProperties: ISelectPlayerProperties<TContext> = {
        innerSystem: null,
        mode: TargetMode.Player,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void {}

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<ISelectPlayerProperties> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.innerSystem.setDefaultTargetFn(() => properties.target);

        return properties;
    }

    public override canAffectInternal(target: Player | Player[], context: TContext, additionalProperties?: Partial<ISelectPlayerProperties>, mustChangeGameState?: GameStateChangeRequired): boolean {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        return properties.innerSystem.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISelectPlayerProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const player = context.player;
        const choices = ['You', 'Opponent'];

        const promptProperties = {
            activePromptTitle: properties.activePromptTitle,
            waitingPromptTitle: (context.ability.type === 'action' ? 'Waiting for opponent to take an action or pass' : 'Waiting for opponent'),
            context: context,
            source: context.source
        };

        if (this.properties.mode === TargetMode.MultiplePlayers) { // Uses a HandlerMenuMultipleSelectionPrompt: handler takes an array of chosen items
            const activePromptTitle = promptProperties.activePromptTitle || 'Choose any number of players';
            const multiSelect = true;
            const handler = (chosen) => {
                const chosenPlayers = chosen.map((choiceTitle) => {
                    switch (choiceTitle) {
                        case 'You':
                            return player;
                        case 'Opponent':
                            return player.opponent;
                        default:
                            Contract.fail('Player other than "You" or "Opponent" chosen');
                    }
                });
                this.addTargetToContext(chosenPlayers, context, properties.name);
                properties.innerSystem.queueGenerateEventGameSteps(events, context, { ...additionalProperties, target: chosenPlayers });
                return true;
            };

            Object.assign(promptProperties, { activePromptTitle, choices, multiSelect, handler });
        } else { // Uses a HandlerMenuPrompt: each choice gets its own handler, called right away when that choice is clicked
            const activePromptTitle = this.properties.activePromptTitle || 'Choose a player';
            const handlers = [player, player.opponent].map(
                (chosenPlayer) => {
                    return () => {
                        this.addTargetToContext(chosenPlayer, context, properties.name);
                        properties.innerSystem.queueGenerateEventGameSteps(events, context, { ...additionalProperties, target: chosenPlayer });
                    };
                }
            );

            Object.assign(promptProperties, { activePromptTitle, choices, handlers });
        }
        context.game.promptWithHandlerMenu(player, promptProperties);
    }

    private addTargetToContext(player: Player | Player[], context: TContext, name: string) {
        if (!context.target || (Array.isArray(context.target) && context.target.length === 0)) {
            context.target = player;
        }

        if (name) {
            context.targets[name] = Helpers.asArray(player);
        }
    }
}