import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class TheMandalorianSwornToTheCreed extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9005139831',
            internalName: 'the-mandalorian#sworn-to-the-creed',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card.controller === context.source.controller && event.card.isUpgrade()
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Exhaust an enemy unit with 4 or less remaining HP',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card) => card.isUnit() && card.remainingHp <= 4,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                },
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Exhaust an enemy unit with 6 or less remaining HP',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card.controller === context.source.controller && event.card.isUpgrade()
            },
            targetResolver: {
                controller: RelativePlayer.Opponent,
                cardCondition: (card) => card.isUnit() && card.remainingHp <= 6,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
        });
    }
}

TheMandalorianSwornToTheCreed.implemented = true;
