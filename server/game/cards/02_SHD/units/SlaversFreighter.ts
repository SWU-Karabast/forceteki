import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardZoneName } from '../../../core/Constants';

export default class SlaversFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6853970496',
            internalName: 'slavers-freighter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'You may ready another unit with power equal to or less than the number of upgrades on enemy units',
            optional: true,
            targetResolver: {
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => {
                    const opponentUpgradeCount = context.player.opponent.getArenaUnits().reduce(
                        (total, unit) => total + unit.upgrades.length,
                        0);
                    return card.isUnit() && card !== context.source && card.getPower() <= opponentUpgradeCount;
                },
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}
