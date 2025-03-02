import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class HeraSyndullaWeveLostEnough extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '9430527677',
            internalName: 'hera-syndulla#weve-lost-enough',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Restore,
            amount: 1
        });
    }
}