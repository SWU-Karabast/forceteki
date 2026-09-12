import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class LeiaOrganaTheseAreMyFriends extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#these-are-my-friends-id',
            internalName: 'leia-organa#these-are-my-friends',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Heal 1 damage from your base',
            when: {
                onCardPlayed: (event, context) =>
                    EnumHelpers.isUnit(event.cardTypeWhenInPlay) &&
                    event.player === context.player &&
                    event.card !== context.source &&
                    event.card.cost <= 3
            },
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({
                amount: 1,
                target: context.player.base
            }))
        });
    }
}