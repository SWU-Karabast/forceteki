import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class LukeSkywalkerProfitOrBeDestroyed extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9677099296',
            internalName: 'luke-skywalker#profit-or-be-destroyed',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Your opponent chooses an effect',
            immediateEffect: abilityHelper.immediateEffects.chooseModalEffects((context) => ({
                amountOfChoices: 1,
                choosingPlayer: RelativePlayer.Opponent,
                choices: {
                    ['Create a Credit token and ready this unit']:
                        abilityHelper.immediateEffects.simultaneous([
                            abilityHelper.immediateEffects.createCreditToken({ target: context.player.opponent }),
                            abilityHelper.immediateEffects.ready()
                        ]),
                    ['Your opponent may deal 5 damage to a unit']:
                        abilityHelper.immediateEffects.selectCard({
                            activePromptTitle: 'Deal 5 damage to a unit',
                            optional: true,
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: abilityHelper.immediateEffects.damage({ amount: 5 })
                        })
                }
            }))
        });
    }
}
