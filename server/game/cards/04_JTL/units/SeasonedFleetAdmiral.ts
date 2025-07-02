import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class SeasonedFleetAdmiral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8247495024',
            internalName: 'seasoned-fleet-admiral',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Give an Experience token to a unit',
            when: {
                onCardsDrawn: (event, context) => event.player === context.player.opponent && context.game.currentPhase === PhaseName.Action,
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
