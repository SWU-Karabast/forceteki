import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class FNTrooperCorps extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'fn-trooper-corps-id',
            internalName: 'fn-trooper-corps',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token another friendly unit',
            targetResolver: {
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
