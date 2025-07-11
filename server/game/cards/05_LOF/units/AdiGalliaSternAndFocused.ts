import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class AdiGalliaSternAndFocused extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'adi-gallia#stern-and-focused-id',
            internalName: 'adi-gallia#stern-and-focused',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to that player\'s base',
            when: {
                onCardPlayed: (event, context) => event.player !== context.player && event.cardTypeWhenInPlay === CardType.Event,
            },
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.player.opponent.base,
            }))
        });
    }
}