import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class DevastatorInescapable extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4631297392',
            internalName: 'devastator#inescapable'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'You may deal damage to a unit equal to the number of resources you control',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({ amount: context.source.controller.resources.length }))
            },
        });
    }
}

DevastatorInescapable.implemented = true;
