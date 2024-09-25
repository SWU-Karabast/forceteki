import AbilityHelper from '../../AbilityHelper';
import { AbilityContext } from '../../core/ability/AbilityContext';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class ShieldedAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Shielded;

    public static buildShieldedAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Shielded',
            when: { onUnitEntersPlay: (event, context) => event.card === context.source },
            immediateEffect: AbilityHelper.immediateEffects.giveShield()
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = ShieldedAbility.buildShieldedAbilityProperties();

        super(game, card, properties);
    }
}