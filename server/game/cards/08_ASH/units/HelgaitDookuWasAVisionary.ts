import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class HelgaitDookuWasAVisionary extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9419144933',
            internalName: 'helgait#dooku-was-a-visionary',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Distribute a number of Advantage tokens equal to this unit\'s power among friendly units',
            contextTitle: (context) => `Distribute ${context.event.lastKnownInformation.power} Advantage tokens among friendly units`,
            immediateEffect: abilityHelper.immediateEffects.distributeAdvantageAmong((context) => ({
                amountToDistribute: context.event.lastKnownInformation.power,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Self,
            }))
        });
    }
}