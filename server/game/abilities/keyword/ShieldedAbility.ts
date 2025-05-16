import TriggeredAbility from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
import type Game from '../../core/Game';
import * as Contract from '../../core/utils/Contract';
import { GiveShieldSystem } from '../../gameSystems/GiveShieldSystem';
import type { ITriggeredAbilityProps } from '../../Interfaces';

export class ShieldedAbility extends TriggeredAbility {
    public readonly keyword: KeywordName = KeywordName.Shielded;

    public static buildShieldedAbilityProperties<TSource extends Card = Card>(): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Shielded',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onLeaderDeployed: (event, context) => event.card === context.source,
                onUnitEntersPlay: (event, context) => event.card === context.source && context.source.isToken()
            },
            immediateEffect: new GiveShieldSystem({}),
            zoneFilter: WildcardZoneName.AnyArena
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = ShieldedAbility.buildShieldedAbilityProperties();

        super(game, card, properties);
    }
}
