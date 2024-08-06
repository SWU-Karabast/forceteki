import { CardTypes, Elements } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class PathOfReflection extends ProvinceCard {
    static id = 'path-of-reflection';

    readonly #conflictElement = `${PathOfReflection.id}-conflict-water`;
    readonly #provinceElement = `${PathOfReflection.id}-province-water`;

    setupCardAbilities() {
        this.action({
            title: "switch a character's base skills",
            conflictProvinceCondition: (province, context) =>
                province.isElement(this.getCurrentElementSymbol(this.#provinceElement)) ||
                context.game.currentConflict?.hasElement?.(this.getCurrentElementSymbol(this.#conflictElement)),
            target: {
                cardType: CardTypes.Character,
                cardCondition: (card) => card.isParticipating() && !card.hasDash(),
                gameAction: AbilityDsl.actions.cardLastingEffect({ effect: AbilityDsl.effects.switchBaseSkills() })
            },
            effect: "switch {0}'s military and political skill"
        });
    }

    getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push(
            { prettyName: 'Conflict Element', key: this.#conflictElement, element: Elements.Water },
            { prettyName: 'Province Element', key: this.#provinceElement, element: Elements.Water }
        );
        return symbols;
    }
}
