import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class LukeSkywalkerAHerosBeginning extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7338701361',
            internalName: 'luke-skywalker#a-heros-beginning',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Use the Force',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card !== context.source &&
                    event.card.unique
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.useTheForce(),
            ifYouDo: {
                title: 'Give an Experience token and a Shield token to this unit',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.giveExperience((context) => ({ target: context.source })),
                    AbilityHelper.immediateEffects.giveShield((context) => ({ target: context.source }))
                ])
            }
        });
    }
}
