import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class LeiaOrganaOnADiplomaticMission extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#on-a-diplomatic-mission-id',
            internalName: 'leia-organa#on-a-diplomatic-mission',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Draw a card, then put a card from your hand on the top or bottom of your deck',
            cost: [abilityHelper.costs.abilityActivationResourceCost(1), abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.draw({ amount: 1 }),
            then: {
                title: 'Select a card from your hand to put on the top or bottom of your deck',
                targetResolver: {
                    activePromptTitle: 'Select a card to put on the top or bottom of your deck',
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: abilityHelper.immediateEffects.chooseModalEffects((context) => ({
                        amountOfChoices: 1,
                        choices: () => ({
                            ['Top']: abilityHelper.immediateEffects.moveToTopOfDeck({ target: context.target }),
                            ['Bottom']: abilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.target }),
                        })
                    }))
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Draw a card, then put a card from your hand on the top or bottom of your deck',
            immediateEffect: abilityHelper.immediateEffects.draw({ amount: 1 }),
            then: {
                title: 'Select a card from your hand to put on the top or bottom of your deck',
                targetResolver: {
                    activePromptTitle: 'Select a card to put on the top or bottom of your deck',
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    immediateEffect: abilityHelper.immediateEffects.chooseModalEffects((context) => ({
                        amountOfChoices: 1,
                        choices: () => ({
                            ['Top']: abilityHelper.immediateEffects.moveToTopOfDeck({ target: context.target }),
                            ['Bottom']: abilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.target }),
                        })
                    }))
                }
            }
        });
    }
}
