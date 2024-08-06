import { CardTypes, Elements } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

const elementKey = 'the-pursuit-of-justice-water';

export default class ThePursuitOfJustice extends ProvinceCard {
    static id = 'the-pursuit-of-justice';

    setupCardAbilities() {
        this.action({
            title: 'Ready a character',
            conflictProvinceCondition: (province) => province.isElement(this.getCurrentElementSymbol(elementKey)),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating(),
                gameAction: AbilityDsl.actions.ready()
            }
        });
    }

    getPrintedElementSymbols() {
        let symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: elementKey,
            prettyName: 'Ability - Province Element',
            element: Elements.Water
        });
        return symbols;
    }
}
