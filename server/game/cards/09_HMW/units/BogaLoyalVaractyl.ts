import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BogaLoyalVaractyl extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2640980103',
            internalName: 'boga#loyal-varactyl',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: `Choose a non-${TextHelper.Trait.Vehicle} unit in your discard pile not named Boga. For this phase, you may play that unit from your discard pile. It costs ${TextHelper.resource(1)} less`,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                cardCondition: (card) => !card.hasSomeTrait(Trait.Vehicle) && card.title !== 'Boga',
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.canPlayFromDiscard({
                        player: RelativePlayer.Self,
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                    })
                })
            }
        });
    }
}