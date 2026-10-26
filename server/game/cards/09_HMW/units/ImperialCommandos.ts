import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class ImperialCommandos extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1409067163',
            internalName: 'imperial-commandos',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a non-leader unit with 4 or less remaining Power.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card) => card.isUnit() && card.getPower() <= 4,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}