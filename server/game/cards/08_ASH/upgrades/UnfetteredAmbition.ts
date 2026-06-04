import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class UnfetteredAmbition extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3431725769',
            internalName: 'unfettered-ambition',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give Advantage tokens for each upgrade which is not Advantage',
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage((context) => {
                const parentCard = context.source.parentCard;
                if (!parentCard || !parentCard.upgrades) {
                    return { amount: 0 };
                }

                const nonAdvantageUpgrades = parentCard.upgrades.filter((u) => !u.isAdvantage());
                return { amount: nonAdvantageUpgrades.length, target: parentCard };
            })
        });
    }
}