import AbilityHelper from '../../AbilityHelper';
import TriggeredAbility from '../../core/ability/TriggeredAbility';
import { Card } from '../../core/card/Card';
import { Duration, KeywordName } from '../../core/Constants';
import Game from '../../core/Game';
import Contract from '../../core/utils/Contract';
import { ITriggeredAbilityProps } from '../../Interfaces';

export class RaidAbility extends TriggeredAbility {
    public override readonly keyword: KeywordName | null = KeywordName.Raid;

    public static buildRaidAbilityProperties(raidAmount: number): ITriggeredAbilityProps {
        return {
            title: `Raid ${raidAmount}`,
            when: { onAttackDeclared: (event, context) => event.attack.attacker === context.source },
            immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((context) => ({
                target: context.source,
                duration: Duration.UntilEndOfAttack,
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: raidAmount, hp: 0 })
            }))
        };
    }

    public constructor(game: Game, card: Card, raidAmount: number) {
        if (!Contract.assertTrue(card.isUnit()) || !Contract.assertNonNegative(raidAmount)) {
            return;
        }

        const properties = RaidAbility.buildRaidAbilityProperties(raidAmount);

        super(game, card, properties);
    }
}