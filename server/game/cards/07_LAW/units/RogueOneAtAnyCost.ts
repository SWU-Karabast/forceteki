import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class RogueOneAtAnyCost extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6685110508',
            internalName: 'rogue-one#at-any-cost'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'look at the top 2 cards of your deck. Put any number of them on the bottom of your deck and the rest on top in any order',
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller === context.player,
            },
            immediateEffect: AbilityHelper.immediateEffects.lookMoveDeckCardsTopOrBottom({ amount: 2 })
        });
    }
}
