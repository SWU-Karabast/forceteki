import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { CardType, KeywordName, RelativePlayer, WildcardZoneName } from '../../core/Constants';
import Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import * as GameSystemLibrary from '../../gameSystems/GameSystemLibrary';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class RestoreAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Restore;

    public static buildRestoreAbilityProperties<TSource extends Card = Card>(restoreAmount: number): ITriggeredAbilityProps<TSource> {
        return {
            title: `Restore ${restoreAmount}`,
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            zoneFilter: WildcardZoneName.AnyArena,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Self,
                immediateEffect: GameSystemLibrary.heal({ amount: restoreAmount })
            }
        };
    }

    public constructor(game: Game, card: Card, restoreAmount: number) {
        Contract.assertTrue(card.isUnit());
        Contract.assertNonNegative(restoreAmount);

        const properties = RestoreAbility.buildRestoreAbilityProperties(restoreAmount);

        super(game, card, properties);
    }
}
