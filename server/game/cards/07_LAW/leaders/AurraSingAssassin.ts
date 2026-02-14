import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AurraSingAssassin extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'aurra-sing#assassin-id',
            internalName: 'aurra-sing#assassin',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Defeat a non-leader unit with 1 or less remaining HP',
            cost: [
                AbilityHelper.costs.exhaustSelf()
            ],
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 1,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Defeat a non-leader unit with 5 or less remaining HP',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 5,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}