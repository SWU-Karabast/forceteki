import AbilityHelper from '../../../AbilityHelper';
import { CardType, KeywordName, ZoneName } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';

export default class TimelyIntervention extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6847268098',
            internalName: 'timely-intervention',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Play a unit from your hand. Give it ambush for this phase',
            targetResolver: {
                cardTypeFilter: CardType.BasicUnit,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.playCardFromHand(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                    }),
                ])
            }
        });
    }
}

TimelyIntervention.implemented = true;
