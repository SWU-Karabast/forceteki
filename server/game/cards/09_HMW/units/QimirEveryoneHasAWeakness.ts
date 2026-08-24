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
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.discardFromDeck((context) => ({
                    amount: 1,
                    target: context.player,
                })),
                abilityHelper.immediateEffects.conditional({
                    // There will be one event for the discard system overall plus one per card, so we need to ensure at least two exist
                    condition: (context) => (context.events.length < 2 ? false : !context.events[0].card?.hasSomeAspect(Aspect.Villainy) ?? false),
                    onTrue: abilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        controller: RelativePlayer.Opponent,
                        immediateEffect: abilityHelper.immediateEffects.giveWeakness()
                    })
                })
            ])
        });
    }
}