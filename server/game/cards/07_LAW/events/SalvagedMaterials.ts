import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { PhaseName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class SalvagedMaterials extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6733770226',
            internalName: 'salvaged-materials',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Play an Item upgrade from your discard pile. It costs 3 resources less. At the start of the next regroup phase, defeat it.',
            targetResolver: {
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeTrait(Trait.Item),
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.playCardFromOutOfPlay({
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 },
                        playAsType: WildcardCardType.Upgrade,
                    }),
                    abilityHelper.immediateEffects.delayedCardEffect({
                        title: 'Defeat this upgrade',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: abilityHelper.immediateEffects.defeat()
                    })
                ])
            }
        });
    }
}