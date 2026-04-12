import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { TargetMode } from '../../../core/Constants';

export default class ThereIsNoConflict extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: 'there-is-no-conflict-id',
            internalName: 'there-is-no-conflict',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return any number of other upgrades on attached unit to their owners hands',
            contextTitle: (context) => `Return any number of other upgrades on ${context.source.parentCard.title} to their owners hands`,
            targetResolver: {
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardCondition: (card, context) => card.isUpgrade() && card !== context.source && card.parentCard === context.source.parentCard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}