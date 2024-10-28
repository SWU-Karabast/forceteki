import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class RazorCrestReliableGunship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8142386948',
            internalName: 'razor-crest#reliable-gunship'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Return an upgrade from your discard pile',
            optional: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Upgrade,
                locationFilter: Location.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

RazorCrestReliableGunship.implemented = true;
