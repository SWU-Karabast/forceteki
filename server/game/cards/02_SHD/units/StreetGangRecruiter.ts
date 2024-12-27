import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait, ZoneName } from '../../../core/Constants';

export default class StreetGangRecruiter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2090698177',
            internalName: 'street-gang-recruiter'
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Return an Underworld card from your discard pile to your hand.',
            optional: true,
            targetResolver: {
                cardCondition: (card) => card.hasSomeTrait(Trait.Underworld),
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            }
        });
    }
}

StreetGangRecruiter.implemented = true;