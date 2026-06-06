import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { IAbilityHelper } from '../../../AbilityHelper';

export default class MayorsMajordomoNoProblemGroveling extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6565211534',
            internalName: 'mayors-majordomo#no-problem-groveling'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Exhaust a unit',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.discardCardFromOwnHand()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                // TODO: check in engine for these sorts of abilities. Exhaust of majordomo should be occuring before the exhaust choice but it is not
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
        });
    }
}