import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CoronaFourJusticeForAlderaan extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5376014521',
            internalName: 'corona-four#justice-for-alderaan',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a unit -2/-0 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                })
            }
        });

        registrar.addWhenDefeatedAbility({
            title: 'Defeat a non-leader unit with 0 power',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isNonLeaderUnit() && card.getPower() === 0,
                immediateEffect: abilityHelper.immediateEffects.defeat()
            }
        });
    }
}
