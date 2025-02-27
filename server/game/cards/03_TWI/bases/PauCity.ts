import { BaseCard } from '../../../core/card/BaseCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, RelativePlayer } from '../../../core/Constants';

export default class PauCity extends BaseCard {
    protected override getImplementationId () {
        return {
            id: '6594935791',
            internalName: 'pau-city',
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'Each leader unit you control gets +0/+1',
            targetController: RelativePlayer.Self,
            targetCardTypeFilter: CardType.LeaderUnit,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}
