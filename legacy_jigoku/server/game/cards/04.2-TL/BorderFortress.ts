import { CardTypes, Locations } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class BorderFortress extends ProvinceCard {
    static id = 'border-fortress';

    setupCardAbilities() {
        this.action({
            title: 'Reveal a province',
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                cardCondition: (card) => card.isFacedown(),
                gameAction: AbilityDsl.actions.reveal({ chatMessage: true })
            },
            effect: "reveal {1}'s facedown province in their {2}",
            effectArgs: (context) => [context.target.controller, context.target.location]
        });
    }
}
