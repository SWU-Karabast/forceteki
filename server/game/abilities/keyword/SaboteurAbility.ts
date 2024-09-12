import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
import { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class SaboteurAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Saboteur;

    public static buildSaboteurAbilityProperties(): ITriggeredAbilityProps {
        return {
            title: 'Saboteur',
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            targetResolver: {
                cardCondition: (card: Card, context: TriggeredAbilityContext) => {
                    const attacker = context.source;
                    if (!attacker.isUnit() || !card.isUnit()) {
                        return false;
                    }

                    return card === attacker.activeAttack.target && card.hasUpgradeWithName('Shield');
                },
                immediateEffect: AbilityHelper.immediateEffects.defeat((context) => ({
                    target: context.source.activeAttack.target.upgrades?.filter((card) => card.title === 'Shield')
                }))
            }
        };
    }

    public constructor(game: Game, card: Card) {
        if (!Contract.assertTrue(card.isUnit())) {
            return;
        }

        const properties = SaboteurAbility.buildSaboteurAbilityProperties();

        super(game, card, properties);
    }
}
