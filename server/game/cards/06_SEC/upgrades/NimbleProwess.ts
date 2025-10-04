import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import type { Card } from '../../../core/card/Card';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Player } from '../../../core/Player';
import { WildcardCardType } from '../../../core/Constants';

export default class NimbleProwess extends UpgradeCard {
    protected override getImplementationId () {
        return {
            id: '8929879236',
            internalName: 'nimble-prowess',
        };
    }

    public override canAttach(targetCard: Card, _context: AbilityContext, controller: Player): boolean {
        return targetCard.isUnit() && targetCard.controller === controller;
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper) {
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