import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class SceneOfTheCrime extends ProvinceCard {
    static id = 'scene-of-the-crime';

    public setupCardAbilities() {
        this.reaction({
            title: "Look at opponent's hand",
            when: {
                onCardRevealed: (event, context) =>
                    event.card === context.source && context.player.opponent !== undefined
            },
            effect: "look at {1}'s hand",
            effectArgs: (context) => context.player.opponent,
            gameAction: AbilityDsl.actions.lookAt((context) => ({
                target: context.player.opponent.hand.sortBy((card: DrawCard) => card.name),
                chatMessage: true
            }))
        });
    }
}
