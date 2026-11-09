import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class R2D2TheFirstProtagonist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8572632099',
            internalName: 'r2d2#the-first-protagonist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Choose one: Ready a resource. Deal 1 damage to a ground unit. Look at the top card of your deck. You may discard it',
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects(() => ({
                amountOfChoices: 1,
                choices: {
                    ['Ready a resource']: abilityHelper.immediateEffects.readyResources({ amount: 1 }),
                    ['Deal 1 damage to a ground unit']: abilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Deal 1 damage to a ground unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        zoneFilter: ZoneName.GroundArena,
                        immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
                    }),
                    ['Look at the top card of your deck. You may discard it']: abilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                        const topCardOfDeck = context.player.getTopCardOfDeck();
                        return {
                            useDisplayPrompt: true,
                            target: topCardOfDeck,
                            perCardButtons: [
                                {
                                    text: 'Discard it',
                                    arg: 'discard',
                                    immediateEffect: abilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                                },
                                {
                                    text: 'Leave it on top of your deck',
                                    arg: 'leave',
                                    immediateEffect: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                                }
                            ]
                        };
                    })
                }
            }))
        });
    }
}