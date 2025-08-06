import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class OutlandTieVanguard extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8712779685',
            internalName: 'outland-tie-vanguard'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an experience to another unit that costs 3 or less',
            optional: true,
            targetResolver: {
                cardCondition: (card, context) => card.isUnit() && card.printedCost <= 3 && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
