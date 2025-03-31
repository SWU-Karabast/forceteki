import type Shield from '../../cards/01_SOR/tokens/Shield';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { TriggeredAbilityContext } from '../../core/ability/TriggeredAbilityContext';
import type { Attack } from '../../core/attack/Attack';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { DefeatCardSystem } from '../../gameSystems/DefeatCardSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class SaboteurDefeatShieldsAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Saboteur;

    public static buildSaboteurAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Saboteur: defeat all shields',
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            zoneFilter: WildcardZoneName.AnyArena,
            targetResolver: {
                cardCondition: (card: Card, context: TriggeredAbilityContext) => {
                    const attacker = context.source;
                    if (!attacker.isUnit() || !card.isUnit()) {
                        return false;
                    }

                    return card === context.event.attack.target && card.hasShield();
                },
                immediateEffect: new DefeatCardSystem((context) => {
                    Contract.assertTrue(context.source.isUnit());

                    let target: Shield[] = [];
                    const attack: Attack = context.event.attack;
                    for (const attackTarget of attack.getAllTargets()) {
                        if (attackTarget.isUnit() && attackTarget.hasShield()) {
                            target = target.concat(attackTarget.upgrades.filter((card) => card.isShield()));
                        }
                    }

                    return { target };
                })
            }
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = SaboteurDefeatShieldsAbility.buildSaboteurAbilityProperties();

        super(game, card, properties);
    }
}
