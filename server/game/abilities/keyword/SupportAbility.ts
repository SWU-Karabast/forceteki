import { TriggeredAbilityBase } from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName } from '../../core/Constants';
import type { Game } from '../../core/Game';
import { Contract } from '../../core/utils/Contract';
import type { ITriggeredAbilityProps } from '../../Interfaces';
import { registerState } from '../../core/GameObjectUtils';
import { InitiateAttackSystem } from '../../gameSystems/InitiateAttackSystem';

@registerState()
export class SupportAbility extends TriggeredAbilityBase {
    public readonly keyword: KeywordName = KeywordName.Support;

    public static buildSupportAbilityProperties<TSource extends Card = Card>(source: TSource): ITriggeredAbilityProps<TSource> {
        return {
            title: 'Support',
            optional: true,
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onLeaderDeployed: (event, context) => event.card === context.source,
                onUnitEntersPlay: (event, context) => event.card === context.source && context.source.isToken()
            },
            targetResolver: {
                activePromptTitle: `Attack with another unit. It gains ${source.title}'s abilities for this attack.`,
                immediateEffect: new InitiateAttackSystem((context) => ({
                    attackerCondition: (card) => card !== context.source,
                    attackerLastingEffects: {
                        effect: context.game.abilityHelper.ongoingEffects
                            .copyNonKeywordAbilitiesFromUnit(context.source)
                    }
                }))
            }
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = SupportAbility.buildSupportAbilityProperties(card);

        super(game, card, properties);
    }
}
