import AbilityHelper from '../../../AbilityHelper';
import { CardType, KeywordName, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';

export default class TimelyIntervention extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6847268098',
            internalName: 'timely-intervention',
        };
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'Play a unit from your hand. Give it ambush for this phase',
            cannotTargetFirst: true,
            targetResolver: {
                // TODO remove cardTypeFilter but fix Choose nothing button before
                cardTypeFilter: CardType.BasicUnit,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({ playAsType: WildcardCardType.Unit }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush)
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                })
            }
        });
    }
}
