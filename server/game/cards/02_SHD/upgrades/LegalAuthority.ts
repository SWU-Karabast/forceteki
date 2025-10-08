import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer } from '../../../core/Constants';

export default class LegalAuthority extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '8877249477',
            internalName: 'legal-authority',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((card, context) => card.controller === context.player);

        registrar.addWhenPlayedAbility({
            title: 'Attached unit captures an enemy non-leader unit with less power than it',
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card, context) => card.isUnit() && card.getPower() < context.source.parentCard.getPower(),
                immediateEffect: AbilityHelper.immediateEffects.capture((context) => ({
                    captor: context.source.parentCard
                }))
            }
        });
    }
}
