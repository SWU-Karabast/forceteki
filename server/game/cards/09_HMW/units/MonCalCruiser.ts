import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class MonCalCruiser extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2411656991',
            internalName: 'mon-cal-cruiser',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Attack with a unit. It gets +2/+0 for this attack or Look at an opponent\'s hand. You may discard a card from it. If you do, they draw a card.',
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects(() => ({
                amountOfChoices: 1,
                activePromptTitle: 'Choose one',
                choices: {
                    ['Attack with a unit']: AbilityHelper.immediateEffects.selectCard({
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.attack({
                            attackerLastingEffects: { effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }) }
                        })
                    }),
                    ['Look at an opponent\'s hand']: AbilityHelper.immediateEffects.lookAtAndSelectCard((context) => ({
                        target: context.player.opponent.hand,
                        immediateEffect: AbilityHelper.immediateEffects.sequential([
                            AbilityHelper.immediateEffects.discardSpecificCard(),
                            AbilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent }))
                        ])
                    }))
                }
            }))
        });
    }
}