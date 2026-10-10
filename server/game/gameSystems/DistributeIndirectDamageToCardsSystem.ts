import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { DamageType, EffectName, MetaEventName, RelativePlayer } from '../core/Constants';
import type { DistributePromptType } from '../core/gameSteps/PromptInterfaces';
import { StatefulPromptType } from '../core/gameSteps/PromptInterfaces';
import { DamageSystem, type IAbilityDamageProperties } from './DamageSystem';
import type { IDistributeAmongTargetsSystemProperties } from './DistributeAmongTargetsSystem';
import { DistributeAmongTargetsSystem } from './DistributeAmongTargetsSystem';

export type IDistributeIndirectDamageToCardsSystemProperties<TContext extends AbilityContext = AbilityContext> =
    Omit<IDistributeAmongTargetsSystemProperties<TContext>, 'canChooseNoTargets' | 'controller' | 'maxTargets'>;

/**
 * System for distributing indirect damage among target cards.
 * Will prompt the user to select where to put the damage (unless auto-selecting a single target is possible).
 */
export class DistributeIndirectDamageToCardsSystem<TContext extends AbilityContext = AbilityContext> extends DistributeAmongTargetsSystem<TContext> {
    public override readonly eventName = MetaEventName.DistributeIndirectDamageToCards;
    public override readonly name = 'distributeIndirectDamageToCards';

    public override promptType: DistributePromptType = StatefulPromptType.DistributeIndirectDamage;

    public constructor(properties: IGameSystemInput<IDistributeIndirectDamageToCardsSystemProperties<TContext>>) {
        super({
            ...properties,
            canChooseNoTargets: false,
            maxTargets: null,
        });
    }

    protected override generateEffectSystem(target: Card = null, amount = 1): DamageSystem {
        // the pending ability damage increase (e.g. Ty Yorrick) is already included in the distributed total
        return new DamageSystem<AbilityContext, IAbilityDamageProperties>({ type: DamageType.Ability, target, amount, isIndirect: true, ignoreAbilityDamageIncrease: true });
    }

    protected override canDistributeLessDefault(): boolean {
        return false;
    }

    protected override getDistributedAmountFromEvent(event): number {
        return event.damageDealt;
    }

    protected override prepareProperties(context: TContext, properties: IDistributeAmongTargetsSystemProperties<TContext>): void {
        properties.player = this.properties.player ?? RelativePlayer.Opponent;
        properties.controller = this.properties.player ?? RelativePlayer.Opponent;
        super.prepareProperties(context, properties);

        if (context.player.assignIndirectDamageDealtToOpponents()) {
            properties.player = RelativePlayer.Self;
        }
        if (context.source.isUnit() && context.source.hasOngoingEffect(EffectName.AssignIndirectDamageDealtByUnit)) {
            properties.player = RelativePlayer.Self;
        }
    }

    protected override getDistributionNouns(): { singular: string } {
        return { singular: 'indirect damage' };
    }

    protected override getDistributionVerb(): string {
        return 'deal';
    }
}
