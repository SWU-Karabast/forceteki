import { EventCard } from '../../../core/card/EventCard';
import { AbilityType, DamageType, KeywordName, RelativePlayer, Trait, WildcardCardType, ZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import { DamageSystem } from '../../../gameSystems/DamageSystem';

export default class ShienFlurry extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7981459508',
            internalName: 'shien-flurry',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Play a Force unit from your hand. It gains Ambush for this phase. The next time it would be dealt damage this phase prevent 2 of that damage',
            cannotTargetFirst: true,
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Force),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous({
                    gameSystems: [
                        AbilityHelper.immediateEffects.playCardFromHand({
                            playAsType: WildcardCardType.Unit,
                        }),
                        AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: [
                                AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                                AbilityHelper.ongoingEffects.gainAbility({
                                    title: 'The next time it would be dealt damage this phase prevent 2 of that damage',
                                    type: AbilityType.ReplacementEffect,
                                    when: {
                                        onDamageDealt: (event, context) => event.card === context.source && !event.isIndirect
                                    },
                                    limit: AbilityHelper.limit.perGame(1),
                                    effect: 'Shien Flurry\'s ability prevents 2 damage to {1}',
                                    effectArgs: (context) => [context.source],
                                    replaceWith: {
                                        replacementImmediateEffect: new DamageSystem((context) => ({
                                            type: context.event.type,
                                            target: context.source,
                                            amount: Math.max(context.event.amount - 2, 0),
                                            source: context.event.damageSource.type === DamageType.Ability ? context.event.damageSource.card : context.event.damageSource.damageDealtBy,
                                            sourceAttack: context.event.damageSource.attack,
                                        }))
                                    },
                                })
                            ]
                        }),
                    ],
                    resolutionMode: ResolutionMode.AllGameSystemsMustBeLegal,
                })
            }
        });
    }
}