import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, ZoneName } from '../../../core/Constants';

export default class JarekYeagerCoordinatingWithTheResistance extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9706341387',
            internalName: 'jarek-yeager#coordinating-with-the-resistance',
        };
    }

    public override setupCardAbilities() {
        this.addPilotingConstantAbilityTargetingAttached({
            title: 'While you control a ground unit and a space unit, attached unit gains Sentinel',
            condition: (context) => context.player.getCardsInZone(ZoneName.SpaceArena).length > 0 && context.player.getCardsInZone(ZoneName.GroundArena).length > 0,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}