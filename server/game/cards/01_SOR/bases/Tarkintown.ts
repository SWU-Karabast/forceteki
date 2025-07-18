import type { IAbilityHelper } from '../../../AbilityHelper';
import { BaseCard } from '../../../core/card/BaseCard';
import type { IBaseAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Tarkintown extends BaseCard {
    protected override getImplementationId() {
        return {
            id: '1393827469',
            internalName: 'tarkintown',
        };
    }

    public override setupCardAbilities(registrar: IBaseAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEpicActionAbility({
            title: 'Deal 3 damage to a damaged non-leader unit',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.damage !== 0,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}
