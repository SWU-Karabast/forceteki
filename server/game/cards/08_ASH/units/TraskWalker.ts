import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class TraskWalker extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6744545975',
            internalName: 'trask-walker',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Choose a unit in your discard pile that costs 7 or less',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasCost() && card.cost <= 7,
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Discard,
                immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects((context) => ({
                    amountOfChoices: 1,
                    choices: () => ({
                        ['Put on the bottom of your deck and heal 3 damage from your base']: AbilityHelper.immediateEffects.simultaneous([
                            AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.target }),
                            AbilityHelper.immediateEffects.heal({ amount: 3, target: context.player.base })
                        ]),
                        ['Return it to your hand']: AbilityHelper.immediateEffects.returnToHand({ target: context.target })
                    })
                }))
            }
        });
    }
}
