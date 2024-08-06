import { CardTypes, Elements } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

const ELEMENT_KEY = 'along-the-river-of-gold-water';

export default class AlongTheRiverOfGold extends ProvinceCard {
    static id = 'along-the-river-of-gold';

    setupCardAbilities() {
        this.action({
            title: "switch a character's base skills",
            conflictProvinceCondition: (province) => province.isElement(this.getCurrentElementSymbol(ELEMENT_KEY)),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && !card.hasDash(),
                gameAction: AbilityDsl.actions.cardLastingEffect({
                    effect: AbilityDsl.effects.switchBaseSkills()
                })
            },
            effect: "switch {0}'s military and political skill"
        });
    }

    getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push({
            key: ELEMENT_KEY,
            prettyName: 'Province Element',
            element: Elements.Water
        });
        return symbols;
    }
}
