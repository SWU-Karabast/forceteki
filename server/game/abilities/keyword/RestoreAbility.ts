import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { CardType, KeywordName, RelativePlayer } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import * as GameSystemLibrary from '../../gameSystems/GameSystemLibrary';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class RestoreAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Restore;

    public static buildRestoreAbilityProperties(restoreAmount: number): ITriggeredAbilityProps {
        return {
            title: `Restore ${restoreAmount}`,
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            targetResolver: {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Self,
                immediateEffect: GameSystemLibrary.heal({ amount: restoreAmount })
            }
        };
    }

    public constructor(game: Game, card: Card, restoreAmount: number) {
        if (!Contract.assertTrue(card.isUnit()) || !Contract.assertNonNegative(restoreAmount)) {
            return;
        }

        const properties = RestoreAbility.buildRestoreAbilityProperties(restoreAmount);

        super(game, card, properties);
    }
}
