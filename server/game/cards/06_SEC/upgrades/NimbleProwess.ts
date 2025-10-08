import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { WildcardCardType } from '../../../core/Constants';

export default class NimbleProwess extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8929879236',
            internalName: 'nimble-prowess',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setAttachCondition((context) => context.attachTarget.controller === context.controllingPlayer);

        registrar.addWhenPlayedAbility({
            title: 'Exhaust a unit in attached unit\'s arena',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.source.parentCard.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}