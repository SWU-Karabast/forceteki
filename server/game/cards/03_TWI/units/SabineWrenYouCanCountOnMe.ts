import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import { AbilityRestriction, Aspect, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SabineWrenYouCanCountOnMe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2843644198',
            internalName: 'sabine-wren#you-can-count-on-me',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While this unit is exhausted, she can\'t be attacked',
            condition: (context) => context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });

        this.addOnAttackAbility({
            title: 'Discard the top card from your deck',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard((context) => ({
                target: context.source.controller.getTopCardOfDeck()
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'If it doesn\'t share an aspect with your base, deal 2 damage to a ground unit',
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => {
                        const cardAspects: Aspect[] = ifYouDoContext.events[0].card.aspects;
                        const baseAspects: Aspect[] = context.source.controller.base.aspects;
                        return !cardAspects.some((cardAspect) => baseAspects.includes(cardAspect));
                    },
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        zoneFilter: ZoneName.GroundArena,
                        innerSystem: AbilityHelper.immediateEffects.damage({ amount: 2 })
                    }),
                    onFalse: AbilityHelper.immediateEffects.noAction(),
                })
            })
        });
    }
}

SabineWrenYouCanCountOnMe.implemented = true;
