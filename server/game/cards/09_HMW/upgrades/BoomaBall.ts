import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class BoomaBall extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '9354439184',
            internalName: 'booma-ball',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return an upgrade that costs 3 or less to its owner\'s hand.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.isUpgrade() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}