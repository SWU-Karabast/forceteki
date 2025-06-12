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
    protected override readonly defaultProperties: Partial<ISelectPlayerProperties<TContext>> = {
        mode: TargetMode.Player,
        name: 'target',
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public eventHandler(event): void {}

    public override generatePropertiesFromContext(context: TContext, additionalProperties: Partial<ISelectPlayerProperties<TContext>> = {}) {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        properties.immediateEffect.setDefaultTargetFn(() => properties.target);

        return properties;
    }

    public override canAffectInternal(target: Player | Player[], context: TContext, additionalProperties?: Partial<ISelectPlayerProperties<TContext>>, mustChangeGameState?: GameStateChangeRequired): boolean {
        const properties = super.generatePropertiesFromContext(context, additionalProperties);
        return properties.immediateEffect.canAffect(target, context, additionalProperties, mustChangeGameState);
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties: Partial<ISelectPlayerProperties<TContext>> = {}): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        const targetResolver = new PlayerTargetResolver(properties.name, { mode: TargetMode.Player, ...properties }, context.ability);
        const targetResults = context.ability.getDefaultTargetResults(context, false);
        targetResolver.resolve(context, targetResults);

        context.game.queueSimpleStep(() => {
            if (!targetResults.cancelled) {
                properties.immediateEffect.queueGenerateEventGameSteps(events, context, additionalProperties);
            }
        }, `Exectute immediate effect for select player system "${properties.name}"`);
    }
}