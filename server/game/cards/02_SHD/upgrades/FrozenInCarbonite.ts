import AbilityHelper from '../../../AbilityHelper';
import type { Card } from '../../../core/card/Card';
import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { AbilityRestriction } from '../../../core/Constants';

export default class FrozenInCarbonite extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7718080954',
            internalName: 'frozen-in-carbonite',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.setAttachCondition((card: Card) => card.isNonLeaderUnit());

        registrar.addWhenPlayedAbility({
            title: 'Exhaust attached unit',
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => ({
                target: context.source.parentCard
            }))
        });

        registrar.addConstantAbilityTargetingAttached({
            title: 'Attached unit can\'t ready',
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.Ready)
        });
    }
}
