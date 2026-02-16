import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class KrrsantanHitAndRun extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'krrsantan#hit-and-run-id',
            internalName: 'krrsantan#hit-and-run',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Return this unit to your hand',
            cost: (context) => AbilityHelper.costs.discardCardsFromOwnHand(2, context.player),
            immediateEffect: AbilityHelper.immediateEffects.returnToHand()
        });
    }
}
