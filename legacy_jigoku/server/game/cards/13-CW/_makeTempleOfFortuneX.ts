import { Elements } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export function makeTempleOfFortuneX(id: string, element: Elements) {
    const elementKeys = [`${id}-${element}-0`, `${id}-${element}-1`];

    return class TempleOfFortuneX extends ProvinceCard {
        static id = id;

        setupCardAbilities() {
            this.persistentEffect({
                condition: (context) =>
                    context.game.rings[this.getCurrentElementSymbol(elementKeys[0])].isConsideredClaimed(),
                effect: AbilityDsl.effects.modifyProvinceStrength(2)
            });

            this.forcedReaction({
                title: 'Place one fate on the unclaimed ring',
                when: {
                    onConflictDeclared: (event, context) =>
                        event.conflict.declaredProvince === context.source &&
                        context.game.rings[this.getCurrentElementSymbol(elementKeys[1])].isUnclaimed()
                },
                gameAction: AbilityDsl.actions.placeFateOnRing((context) => ({
                    target: context.game.rings[this.getCurrentElementSymbol(elementKeys[1])]
                }))
            });
        }

        getPrintedElementSymbols() {
            let symbols = super.getPrintedElementSymbols();
            symbols.push({ element, key: elementKeys[0], prettyName: 'Strength Bonus' });
            symbols.push({ element, key: elementKeys[1], prettyName: 'Fate Ring' });
            return symbols;
        }
    };
}
