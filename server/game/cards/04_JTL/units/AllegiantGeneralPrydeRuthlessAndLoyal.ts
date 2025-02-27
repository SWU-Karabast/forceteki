import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType } from '../../../core/Constants';

export default class AllegiantGeneralPrydeRuthlessAndLoyal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9611596703',
            internalName: 'allegiant-general-pryde#ruthless-and-loyal',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Defeat a non-unique upgrade on it',
            when: {
                onIndirectDamageDealtToPlayer: (event, context) => {
                    return event.target.isUnit();
                },
            },
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => {
                    return !card.unique && card.isUpgrade() && card.parentCard === context.event.target;
                },
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });

        this.addOnAttackAbility({
            title: 'Deal 2 indirect damage to a player',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasInitiative(),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    mode: TargetMode.Player,
                    innerSystem: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 2 }),
                }),
                onFalse: AbilityHelper.immediateEffects.noAction(),
            })
        });
    }
}
