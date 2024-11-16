import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardLocation } from '../../../core/Constants';

export default class SlaversFreighter extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6853970496',
            internalName: 'slavers-freighter',
        };
    }

    protected override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may ready another unit with power equal to or less than the number of upgrades on enemy units',
            optional: true,
            targetResolver: {
                locationFilter: WildcardLocation.AnyArena,
                cardCondition: (card, context) => card.isUnit() && card.getPower() <= context.source.controller.opponent.getUnitsInPlay().reduce((total, unit) => total + unit.upgrades.length, 0),
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}

SlaversFreighter.implemented = true;
