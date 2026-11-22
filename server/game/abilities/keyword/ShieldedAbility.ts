import { TriggeredAbilityBase } from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, TokenUpgradeName, WildcardZoneName } from '../../core/Constants';
import type { Game } from '../../core/Game';
import { Contract } from '../../core/utils/Contract';
import { TextHelper } from '../../core/utils/TextHelper';
import { GiveTokenUpgradeSystem } from '../../gameSystems/GiveTokenUpgradeSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

import { registerState } from '../../core/GameObjectUtils';

@registerState()
export class ShieldedAbility extends TriggeredAbilityBase {
    public readonly keyword: KeywordName = KeywordName.Shielded;

    public static buildShieldedAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: `${TextHelper.Shielded}`,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onLeaderDeployed: (event, context) => event.card === context.source,
                onUnitEntersPlay: (event, context) => event.card === context.source && context.source.isToken()
            },
            immediateEffect: new GiveTokenUpgradeSystem({ tokenType: TokenUpgradeName.Shield }),
            zoneFilter: WildcardZoneName.AnyArena
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = ShieldedAbility.buildShieldedAbilityProperties();

        super(game, card, properties);
    }
}
