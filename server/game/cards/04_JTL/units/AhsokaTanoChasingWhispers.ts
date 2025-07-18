import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class AhsokaTanoChasingWhispers extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3388566378',
            internalName: 'ahsoka-tano#chasing-whispers',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'An opponent discards a card from their hand. If it\'s a unit, exhaust a unit',
            immediateEffect: AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                amount: 1,
                target: context.player.opponent
            })),
            ifYouDo: {
                title: 'Exhaust a unit',
                ifYouDoCondition: (context) => EnumHelpers.isUnit(context.events[0]?.card?.type),
                optional: true,
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }
            }
        });
    }
}
