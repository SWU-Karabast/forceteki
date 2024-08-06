import { CardTypes, Durations } from '../../../Constants';
import { StrongholdCard } from '../../../StrongholdCard';
import AbilityDsl from '../../../abilitydsl';

export default class ThunderboltTower extends StrongholdCard {
    static id = 'thunderbolt-tower';

    setupCardAbilities() {
        this.action({
            title: 'Give a character -2/-2',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => !card.isParticipating(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    duration: Durations.UntilEndOfPhase,
                    effect: AbilityDsl.effects.modifyBothSkills(-2)
                })
            },
            effect: 'give {0} -2{1}/-2{2} for the phase',
            effectArgs: () => ['military', 'political']
        });
    }
}
