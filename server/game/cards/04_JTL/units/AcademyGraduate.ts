import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class AcademyGraduate extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3874382333',
            internalName: 'academy-graduate',
        };
    }

    public override setupCardAbilities () {
        this.addPilotingGainKeywordTargetingAttached({
            keyword: KeywordName.Sentinel
        });
    }
}