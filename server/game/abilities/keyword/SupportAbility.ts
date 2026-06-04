import { TriggeredAbilityBase } from '../../core/ability/TriggeredAbility';
import type { Card } from '../../core/card/Card';
import { KeywordName, WildcardZoneName } from '../../core/Constants';
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
            zoneFilter: WildcardZoneName.AnyArena,
            targetResolver: {
                activePromptTitle: `Attack with another unit. It gains ${source.title}'s abilities for this attack.`,
                immediateEffect: new InitiateAttackSystem((context) => {
                    // Snapshot keywords at the time of attack so dynamically gained keywords don't continue to update
                    // after the attack is initiated.
                    const keywords = context.source.keywords.filter((instance) => instance.name !== KeywordName.Support);
                    return {
                        attackerCondition: (card) => card !== context.source,
                        attackerLastingEffects: {
                            effect: [
                                context.game.abilityHelper.ongoingEffects
                                    .gainNonKeywordAbilitiesFromUnit(context.source),
                                context.game.abilityHelper.ongoingEffects.gainKeywords(() =>
                                    keywords.map((keyword) => keyword.toProperties())
                                )
                            ]
                        }
                    };
                })
            }
        };
    }

    public constructor(game: Game, card: Card) {
        Contract.assertTrue(card.isUnit());

        const properties = SupportAbility.buildSupportAbilityProperties(card);

        super(game, card, properties);
    }
}
