import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class StrikeForceXWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'strike-force-xwing-id',
            internalName: 'strike-force-xwing',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ready unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && !card.exhausted,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
