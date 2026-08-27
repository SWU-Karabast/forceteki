import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TextHelper } from '../../../core/utils/TextHelper';
import { Aspect, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class QimirEveryoneHasAWeakness extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'qimir#everyone-has-a-weakness-id',
            internalName: 'qimir#everyone-has-a-weakness'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: `Discard the top card of your deck. If it's not ${TextHelper.Villainy}, give a Weakness token to an enemy unit.`,
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.player,
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Give a Weakness token to an enemy unit',
                ifYouDoCondition: () => !ifYouDoContext.events[0].card.hasSomeAspect(Aspect.Villainy),
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Opponent,
                    immediateEffect: abilityHelper.immediateEffects.giveWeakness()
                }
            })
        });
    }
}