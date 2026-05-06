import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class MotherTalzinStealingTheSpirit extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6272807676',
            internalName: 'mother-talzin#stealing-the-spirit',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        // THIS IMPLEMENTATION IS NOT ACCURATE FOR TWIN SUNS
        registrar.addWhenDefeatedAbility({
            title: 'Look at an opponent\'s hand and discard a card from it. If you do, they draw a card. If the discarded card is a unit, for this phase you may play it from their discard pile, ignoring its aspect penalties.',
            immediateEffect: abilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                target: context.player.opponent.hand,
                immediateEffect: abilityHelper.immediateEffects.sequential([
                    abilityHelper.immediateEffects.discardSpecificCard(),
                    abilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent })),
                ])
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'For this phase you may play it from their discard pile, ignoring its aspect penalties',
                ifYouDoCondition: () => ifYouDoContext.selectedPromptCards?.length === 1 && ifYouDoContext.selectedPromptCards[0].isUnit(),
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        target: ifYouDoContext.selectedPromptCards[0],
                        effect: abilityHelper.ongoingEffects.canPlayFromDiscard({ player: ifYouDoContext.player })
                    }),
                    abilityHelper.immediateEffects.forThisPhasePlayerEffect({
                        effect: abilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                            match: (card) => card === ifYouDoContext.selectedPromptCards[0],
                        })
                    })
                ])
            })
        });
    }
}