import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { PlayerTargetResolver } from '../core/ability/abilityTargets/PlayerTargetResolver';
import type { GameStateChangeRequired, MetaEventName } from '../core/Constants';
import { TargetMode } from '../core/Constants';
import type { GameEvent } from '../core/event/GameEvent';
import type { IPlayerTargetSystemProperties } from '../core/gameSystem/PlayerTargetSystem';
import { PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';
import type { Player } from '../core/Player';
import type { IPlayerTargetResolver } from '../TargetInterfaces';

export type ISelectPlayerProperties<TContext extends AbilityContext = AbilityContext> = IPlayerTargetSystemProperties
  & Omit<IPlayerTargetResolver<TContext>, 'immediateEffect' | 'mode'>
  & Required<Pick<IPlayerTargetResolver<TContext>, 'immediateEffect'>>
  & Partial<Pick<IPlayerTargetResolver<TContext>, 'mode'>>
  & {
      name?: string;
  };

export class SelectPlayerSystem<TContext extends AbilityContext = AbilityContext> extends PlayerTargetSystem<TContext, ISelectPlayerProperties<TContext>> {
    public override readonly name: string = 'selectPlayer';
    public override readonly effectDescription: string = 'choose a player';
    public override readonly eventName: MetaEventName.SelectPlayer;
    protected override readonly defaultProperties: IGameSystemInput<Partial<ISelectPlayerProperties<TContext>>> = {
        mode: TargetMode.Player,
        name: 'target',
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    protected override eventHandlerInternal(): void {}

    protected override prepareProperties(context: TContext, properties: ISelectPlayerProperties<TContext>): void {
        super.prepareProperties(context, properties);

        properties.immediateEffect.setDefaultTargetFn(() => properties.target);
    }

    protected override canAffectInternal(target: Player | Player[], context: TContext, properties: ISelectPlayerProperties<TContext>, mustChangeGameState: GameStateChangeRequired, additionalProperties: Partial<IGameSystemInput<ISelectPlayerProperties<TContext>>> = {}): boolean {
        return properties.immediateEffect.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    protected override queueGenerateEventGameStepsInternal(events: GameEvent[], context: TContext, properties: ISelectPlayerProperties<TContext>, additionalProperties: Partial<IGameSystemInput<ISelectPlayerProperties<TContext>>> = {}): void {
        const targetResolver = new PlayerTargetResolver(properties.name, { mode: TargetMode.Player, ...properties }, context.ability);
        const targetResults = context.ability.getDefaultTargetResults(context, false);
        targetResolver.resolve(context, targetResults);

        context.game.queueSimpleStep(() => {
            if (!targetResults.cancelled) {
                properties.immediateEffect.queueGenerateEventGameSteps(events, context, additionalProperties);
            }
        }, `Execute immediate effect for select player system "${properties.name}"`);
    }
}