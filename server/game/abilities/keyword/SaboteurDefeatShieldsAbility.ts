import type Shield from '../../cards/01_SOR/tokens/Shield';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Attack } from '../../core/attack/Attack';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { DefeatCardSystem } from '../../gameSystems/DefeatCardSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class SaboteurDefeatShieldsAbility extends TriggeredAbility {
    public readonly keyword: KeywordName = KeywordName.Saboteur;

    public static buildSaboteurAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Saboteur: defeat all shields',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source &&
                  event.attack.attacker.isUnit() &&
                  event.attack.getAllTargets().some((target) => target.isUnit())
            },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: new DefeatCardSystem((context) => {
                Contract.assertTrue(context.source.isUnit());

                let target: Shield[] = [];
                const attack: Attack = context.event.attack;
                target = attack.getAllTargets().filter((target) => target.isUnit())
                    .filter((target) => target.isInPlay())
                    .flatMap((target) => target.upgrades.filter((card) => card.isShield()));

                return { target };
            })
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = SaboteurDefeatShieldsAbility.buildSaboteurAbilityProperties();

        super(game, card, properties);
    }
}
