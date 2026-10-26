import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class CommandeeredTourShuttle extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4304460989',
            internalName: 'commandeered-tour-shuttle'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready another unit with 3 or less power',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.isUnit() && card.getPower() <= 3,
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}