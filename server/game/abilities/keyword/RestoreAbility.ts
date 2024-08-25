import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { CardType, Keyword, RelativePlayer } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class RestoreAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, restoreAmount: number) {
        if (!Contract.assertTrue(card.isUnit())) {
            return;
        }

        const properties: ITriggeredAbilityProps = {
            title: `Restore ${restoreAmount}`,
            when: { onAttackDeclared: (event) => event.attack.attacker === card },
            keyword: Keyword.Restore,
            targetResolver: {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.heal({ amount: restoreAmount })
            }
        };

        super(game, card, properties);
    }
}