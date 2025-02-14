import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DamageType, MetaEventName, RelativePlayer } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { DamageSystem } from './DamageSystem';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';

export type IDistributeIndirectDamageSystemProperties<TContext extends AbilityContext = AbilityContext> =
    Omit<IDistributeAmongTargetsSystemProperties<TContext>, 'canChooseNoTargets' | 'controller' | 'maxTargets'>;

/**
 * System for distributing indirect damage among target cards.
 * Will prompt the user to select where to put the damage (unless auto-selecting a single target is possible).
 */
export class DistributeIndirectDamageSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    protected override readonly eventName = MetaEventName.DistributeIndirectDamage;
    public override readonly name = 'distributeIndirectDamage';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeIndirectDamage;

    public constructor(properties: IDistributeIndirectDamageSystemProperties<TContext>) {
        super({
            ...properties,
            canChooseNoTargets: false,
            maxTargets: null,
        });
    }

    protected override generateEffectSystem(target: Card = null, amount = 1): DamageSystem {
        return new DamageSystem({ type: DamageType.Ability, target, amount, indirect: true });
    }

    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event): number {
        return event.damageDealt;
    }

    public override generatePropertiesFromContext(context: TContext, additionalProperties: any = {}): IDistributeAmongTargetsSystemProperties<AbilityContext<Card>> {
        const properties = super.generatePropertiesFromContext(context, {
            ...additionalProperties,
            player: RelativePlayer.Opponent,
            controller: this.properties.player ?? RelativePlayer.Opponent,
        });

        if (context.player.assignIndirectDamageDealtToOpponents()) {
            properties.player = RelativePlayer.Self;
        }

        return properties;
    }
}
