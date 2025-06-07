import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class EighthBrotherHuntTogether extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7821324752',
            internalName: 'eighth-brother#hunt-together'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Use the Force to give a unit +2/+2',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give a unit +2/+2',
                targetResolver: {
                    // cardTypeFilter: CardType.BasicUnit && CardType.LeaderUnit,
                    cardCondition: (card) => card.isUnit(),
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                    }),
                },
            }
        });
    }
}