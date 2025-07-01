import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';

export default class JarekYeagerCoordinatingWithTheResistance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9706341387',
            internalName: 'jarek-yeager#coordinating-with-the-resistance',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingGainKeywordTargetingAttached({
            gainCondition: (context) => context.player.hasSomeArenaCard({ arena: ZoneName.SpaceArena }) && context.player.getCardsInZone(ZoneName.GroundArena).length > 0,
            keyword: KeywordName.Sentinel
        });
    }
}