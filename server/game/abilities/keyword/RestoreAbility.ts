import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import * as GameSystemLibrary from '../../gameSystems/GameSystemLibrary';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class RestoreAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Restore;

    public static buildRestoreAbilityProperties<TSource extends Card = Card>(restoreAmount: number): ITriggeredAbilityProps<TSource> {
        return {
            title: `Restore ${restoreAmount}`,
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            zoneFilter: WildcardZoneName.AnyArena,
            immediateEffect: GameSystemLibrary.heal((context) => ({
                amount: restoreAmount,
                target: context.source.controller.base
            }))
        };
    }

    public constructor(game: Game, card: Card, restoreAmount: number) {
        Contract.assertTrue(card.isUnit());
        Contract.assertNonNegative(restoreAmount);

        const properties = RestoreAbility.buildRestoreAbilityProperties(restoreAmount);

        super(game, card, properties);
    }
}
