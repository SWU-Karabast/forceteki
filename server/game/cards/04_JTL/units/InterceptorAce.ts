import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class InterceptorAce extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3878744555',
            internalName: 'interceptor-ace',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Grit
        });
    }
}