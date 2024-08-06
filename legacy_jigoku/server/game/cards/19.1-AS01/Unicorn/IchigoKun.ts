import type { AbilityContext } from '../../../AbilityContext';
import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Elements, Players, TargetModes } from '../../../Constants';
import DrawCard from '../../../drawcard';

const VULNERABLE_ELEMENT = 'ichigo-kun-fire';

const MORE_MIL_LESS_GLORY = 'Increase own military, reduce other glory';
const LESS_MIL_MORE_GLORY = 'Reduce own military, increase other glory';

export default class IchigoKun extends DrawCard {
    static id = 'ichigo-kun';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) =>
                context.game.currentConflict &&
                context.game.currentConflict.hasElement(this.getCurrentElementSymbol(VULNERABLE_ELEMENT)),
            effect: AbilityDsl.effects.setBaseMilitarySkill(0)
        });

        this.action({
            title: 'Modify military skill and glory',
            targets: {
                otherCharacter: {
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card, context) => card.isParticipating() && card !== context.source
                },
                select: {
                    mode: TargetModes.Select,
                    dependsOn: 'otherCharacter',
                    choices: (context) => ({
                        [MORE_MIL_LESS_GLORY]: this.actionSequence(context, { military: +2, glory: -2 }),
                        [LESS_MIL_MORE_GLORY]: this.actionSequence(context, { military: -2, glory: +2 })
                    })
                }
            },
            effect: 'give {0} {1} {2} and {3} {4} glory - {0} {5}',
            effectArgs: (context) =>
                context.selects.select.choice === MORE_MIL_LESS_GLORY
                    ? ['+2', 'military', context.targets.otherCharacter, '-2', 'is wild today!']
                    : ['-2', 'military', context.targets.otherCharacter, '+2', 'is well-behaved. Impressive!']
        });
    }

    public getPrintedElementSymbols() {
        const symbols = super.getPrintedElementSymbols();
        symbols.push({ key: VULNERABLE_ELEMENT, prettyName: 'Restricted Ring', element: Elements.Fire });
        return symbols;
    }

    private actionSequence(context: AbilityContext<this>, modifiers: { military: number; glory: number }) {
        return AbilityDsl.actions.sequential([
            AbilityDsl.actions.moveToConflict({ target: context.source }),
            AbilityDsl.actions.multiple([
                AbilityDsl.actions.cardLastingEffect({
                    target: context.source,
                    effect: AbilityDsl.effects.modifyMilitarySkill(modifiers.military)
                }),
                AbilityDsl.actions.cardLastingEffect({
                    target: context.targets.otherCharacter,
                    effect: AbilityDsl.effects.modifyGlory(modifiers.glory)
                })
            ])
        ]);
    }
}
