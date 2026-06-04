import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class ReanimatedNightTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9790448244',
            internalName: 'reanimated-night-trooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Look at the top card of a deck. You may discard it.',
            targetResolver: {
                activePromptTitle: 'Choose a deck to look at the top card',
                mode: TargetMode.Select,
                choices: (context) => ({
                    ['Your deck']: AbilityHelper.immediateEffects.lookAtAndChooseOption(() => {
                        const topCardOfDeck = context.player.getTopCardOfDeck();

                        return {
                            target: topCardOfDeck,
                            perCardButtons: [
                                {
                                    text: 'Discard it',
                                    arg: 'discard',
                                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                                },
                                {
                                    text: 'Leave it on top',
                                    arg: 'leave',
                                    immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                                }
                            ]
                        };
                    }),
                    ['Opponent\'s deck']: AbilityHelper.immediateEffects.lookAtAndChooseOption(() => {
                        const topCardOfDeck = context.player.opponent.getTopCardOfDeck();

                        return {
                            target: topCardOfDeck,
                            perCardButtons: [
                                {
                                    text: 'Discard it',
                                    arg: 'discard',
                                    immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                                },
                                {
                                    text: 'Leave it on top',
                                    arg: 'leave',
                                    immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                                }
                            ]
                        };
                    })
                })
            }
        });
    }
}
