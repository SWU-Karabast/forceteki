import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect, WildcardCardType } from '../../../core/Constants';

export default class AnakinSkywalkerChampionOfMortis extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4236013558',
            internalName: 'anakin-skywalker#champion-of-mortis'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If there a Heroism card in your discard pile, you may give a unit -3/-3 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.discardZone.hasSomeCard({ aspect: Aspect.Heroism }),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    })
                })
            },
        });

        registrar.addWhenPlayedAbility({
            title: 'If there a Villainy card in your discard pile, you may give a unit -3/-3 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.discardZone.hasSomeCard({ aspect: Aspect.Villainy }),
                    onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: -3 })
                    })
                })
            },
        });
    }
}
