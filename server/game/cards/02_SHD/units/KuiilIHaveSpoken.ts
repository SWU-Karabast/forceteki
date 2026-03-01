import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Aspect } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelpers';

export default class KuiilIHaveSpoken extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5511838014',
            internalName: 'kuiil#i-have-spoken',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: `Discard a card from your deck. If it has a ${TextHelper.aspects(Aspect.Vigilance)} aspect icon, return it to your hand`,
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player
            })),
            ifYouDo: (context) => ({
                title: `If it has a ${TextHelper.aspects(Aspect.Vigilance)} aspect icon, return it to your hand`,
                ifYouDoCondition: () => this.hasMatchingAspects(context),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand({
                    target: context.events[0].card
                })
            })
        });
    }

    private hasMatchingAspects(context) {
        const baseAspects = context.player.base.aspects;
        const discardedCardAspects = context.events[0].card.aspects;

        return baseAspects.some((aspect) => discardedCardAspects.includes(aspect));
    }
}
