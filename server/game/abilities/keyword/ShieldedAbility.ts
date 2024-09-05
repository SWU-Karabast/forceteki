import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

/** @deprecated remove this if it turns out we dont need it */
export class ShieldedAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Raid;

    public static buildShieldedAbilityProperties(): ITriggeredAbilityProps {
        return {
            title: 'Shielded',
            when: { onUnitEntersPlay: (event) => event.card === this },
            immediateEffect: AbilityHelper.immediateEffects.giveShield()
        };
    }

    public constructor(game: Game, card: Card) {
        if (!Contract.assertTrue(card.isUnit())) {
            return;
        }

        const properties = ShieldedAbility.buildShieldedAbilityProperties();

        super(game, card, properties);
    }
}