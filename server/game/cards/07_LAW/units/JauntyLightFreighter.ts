import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class JauntyLightFreighter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: 'jaunty-light-freighter-id',
            internalName: 'jaunty-light-freighter',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Experience token to this unit for each different aspect among units your control',
            immediateEffect: abilityHelper.immediateEffects.giveExperience((context) => ({
                target: context.source,
                amount: new Set(
                    context.player.getArenaUnits()
                        .map((x) => x.aspects)
                        .flat()
                ).size
            }))
        });
    }
}
