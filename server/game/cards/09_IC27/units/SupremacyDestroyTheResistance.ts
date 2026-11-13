import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class SupremacyDestroyTheResistance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9197227181',
            internalName: 'supremacy#destroy-the-resistance',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal damage to a base equal to half its remaining HP, rounded down',
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: Math.floor(context.target.remainingHp / 2)
                }))
            }
        });
    }
}