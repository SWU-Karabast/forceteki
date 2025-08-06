import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { Aspect, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class KyloRenKillingThePast extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6263178121',
            internalName: 'kylo-ren#killing-the-past'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addIgnoreSpecificAspectPenaltyAbility({
            title: 'If you control Rey, ignore the Villainy aspect when playing this',
            ignoredAspect: Aspect.Villainy,
            condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Rey')
        });

        registrar.addOnAttackAbility({
            title: 'Give a unit +2/0 for this phase',
            targetResolver: {
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.target.aspects.includes(Aspect.Villainy),
                        onFalse: AbilityHelper.immediateEffects.giveExperience()
                    })
                ])
            },
        });
    }
}
