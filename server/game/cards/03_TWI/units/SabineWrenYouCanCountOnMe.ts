import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';
import type { Aspect } from '../../../core/Constants';
import { AbilityRestriction, RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class SabineWrenYouCanCountOnMe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2843644198',
            internalName: 'sabine-wren#you-can-count-on-me',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While this unit is exhausted, she can\'t be attacked',
            condition: (context) => context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });

        registrar.addOnAttackAbility({
            title: 'Discard the top card from your deck',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard((context) => ({
                target: context.player.getTopCardOfDeck()
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'If it doesn\'t share an aspect with your base, deal 2 damage to a ground unit',
                ifYouDoCondition: (context) => {
                    const cardAspects: Aspect[] = ifYouDoContext.events[0].card.aspects;
                    const baseAspects: Aspect[] = context.player.base.aspects;
                    return !cardAspects.some((cardAspect) => baseAspects.includes(cardAspect));
                },
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
                }
            })
        });
    }
}
