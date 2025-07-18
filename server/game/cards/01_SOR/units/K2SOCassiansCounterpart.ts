import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class K2SOCassiansCounterpart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3232845719',
            internalName: 'k2so#cassians-counterpart',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        // TODO: This doesn't support Twin Sun correctly
        registrar.addWhenDefeatedAbility({
            title: 'Deal 3 damage to your opponent\'s base or your opponent discards a card from their hand',
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Deal 3 damage to opponent\'s base']: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: 3,
                        target: context.player.opponent.base,
                    })),
                    ['The opponent discards a card']: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        amount: 1,
                        target: context.player.opponent,
                    })),
                }
            }
        });
    }
}
