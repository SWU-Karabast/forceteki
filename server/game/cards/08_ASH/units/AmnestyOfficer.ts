import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class AmnestyOfficer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0978988682',
            internalName: 'amnesty-officer',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Exhaust a unit with one or more keywords',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.keywords.length > 0,
                immediateEffect: abilityHelper.immediateEffects.exhaust()
            }
        });
    }
}