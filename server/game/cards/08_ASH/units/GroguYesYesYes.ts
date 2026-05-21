import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GroguYesYesYes extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'grogu#yes-yes-yes-id',
            internalName: 'grogu#yes-yes-yes',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Attack with a unit',
            when: {
                onClaimInitiative: (event, context) => event.player === context.player,
            },
            targetResolver: {
                canChooseNoCards: true,
                immediateEffect: abilityHelper.immediateEffects.attack(),
            },
        });
    }
}