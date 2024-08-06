import AbilityDsl from '../../abilitydsl';
import { CardTypes, Players } from '../../Constants';
import DrawCard from '../../drawcard';

export default class ShosuroActor extends DrawCard {
    static id = 'shosuro-actor';

    setupCardAbilities() {
        this.action({
            title: 'Choose a character to copy',
            condition: (context) => context.source.isParticipating(),
            target: {
                player: Players.Self,
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card) => !card.isUnique(),
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.source,
                    effect: AbilityDsl.effects.copyCard(context.target)
                }))
            },
            effect: 'become a copy of {1}',
            effectArgs: (context) => [context.target]
        });
    }
}
