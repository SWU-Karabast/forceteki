import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, DamageType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';

export default class MaulShadowCollectiveVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8862896760',
            internalName: 'maul#shadow-collective-visionary',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give an experience token to a unit',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card.hasSomeTrait(Trait.Underworld) && card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    // don't bother triggering the ability if we're attacking a base
                    condition: (context) => !context.event.attack.target.isBase(),
                    onTrue: AbilityHelper.immediateEffects.forThisAttackCardEffect((maulContext) => ({
                        target: maulContext.source,
                        effect: AbilityHelper.ongoingEffects.gainAbility({
                            title: 'Redirect combat damage to another Underworld unit',
                            type: AbilityType.ReplacementEffect,
                            when: {
                                onDamageDealt: (event, context) =>
                                    event.card === context.source && event.type === DamageType.Combat
                            },
                            replaceWith: {
                                target: maulContext.target,
                                replacementImmediateEffect: AbilityHelper.immediateEffects.damage(
                                    (damageContext) => ({
                                        amount: damageContext.event.amount,
                                        source: damageContext.source
                                    })
                                )
                            }
                        })
                    })),
                    onFalse: AbilityHelper.immediateEffects.noAction()
                })
            }
        });
    }
}

MaulShadowCollectiveVisionary.implemented = true;
