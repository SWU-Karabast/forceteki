import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class DoctorPershing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '6722700037',
            internalName: 'doctor-pershing#experimenting-with-life',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Draw a card',
            cost: [
                AbilityHelper.costs.exhaustSelf(),
                AbilityHelper.costs.dealDamage(1, {
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit
                })
            ],
            immediateEffect: AbilityHelper.immediateEffects.draw((context) => ({ target: context.player }))
        });
    }
}
