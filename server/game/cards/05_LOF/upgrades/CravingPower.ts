import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class CravingPower extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3848295601',
            internalName: 'craving-power',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card, context) => card.controller === context.player);

        registrar.addWhenPlayedAbility({
            title: 'Deal damage to an enemy unit equal to attached unit\'s power',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                zoneFilter: WildcardZoneName.AnyArena,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.parentCard?.getPower()
                })),
            }
        });
    }
}