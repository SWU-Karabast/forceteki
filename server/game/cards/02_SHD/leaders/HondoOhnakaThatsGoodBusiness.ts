import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { PlayType } from '../../../core/Constants';

export default class HondoOhnakaThatsGoodBusiness extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3045538805',
            internalName: 'hondo-ohnaka#thats-good-business',
        };
    }

    protected override setupLeaderSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Exhaust this leader to give an Experience token to a unit',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.playType === PlayType.Smuggle
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Give an Experience token to a unit',
                targetResolver: {
                    immediateEffect: AbilityHelper.immediateEffects.giveExperience()
                },
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(card: this) {
        card.addTriggeredAbility({
            title: 'Give an Experience token to a unit',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.player === context.player && event.playType === PlayType.Smuggle
            },
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            },
        });
    }
}
