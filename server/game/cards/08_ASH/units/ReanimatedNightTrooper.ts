import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';
import type { Player } from '../../../core/Player';

export default class ReanimatedNightTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9790448244',
            internalName: 'reanimated-night-trooper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Look at the top card of a deck',
            targetResolver: {
                activePromptTitle: 'Choose a deck to look at the top card',
                mode: TargetMode.Select,
                showUnresolvable: true,
                choices: (context) => ({
                    ['Your deck']: this.lookAtTopCardOfDeckAndChooseDiscard(AbilityHelper, context.player),
                    ['Opponent\'s deck']: this.lookAtTopCardOfDeckAndChooseDiscard(AbilityHelper, context.player.opponent)
                })
            }
        });
    }

    private lookAtTopCardOfDeckAndChooseDiscard(AbilityHelper: IAbilityHelper, player: Player) {
        return AbilityHelper.immediateEffects.lookAtAndChooseOption(() => {
            const topCardOfDeck = player.getTopCardOfDeck();

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
        });
    }
}
