import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class K2SOCassiansCounterpart extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3232845719',
            internalName: 'k2so#cassians-counterpart',
        };
    }

    public override setupCardAbilities() {
        // TODO: This doesn't support Twin Sun correctly
        this.addWhenDefeatedAbility({
            title: 'Deal 3 damage to your opponent\'s base or your opponent discards a card from their hand',
            targetResolver: {
                mode: TargetMode.Select,
                choices: {
                    ['Deal 3 damage to opponent\'s base']: AbilityHelper.immediateEffects.damage((context) => ({
                        amount: 3,
                        target: context.source.controller.opponent.base,
                    })),
                    ['The opponent discards a card']: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        amount: 1,
                        target: context.source.controller.opponent,
                    })),
                }
            }
        });
    }
}

K2SOCassiansCounterpart.implemented = true;
