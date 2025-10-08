import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';

export default class MoralAuthority extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '0475605203',
            internalName: 'moral-authority',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card, context) => card.unique && card.controller === context.player);

        registrar.addWhenPlayedAbility({
            title: 'Attached unit captures an enemy non-leader unit with less remaining HP than it',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isUnit() && card.remainingHp < context.source.parentCard.remainingHp,
                immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                    captor: context.source.parentCard
                }))
            }
        });
    }
}
