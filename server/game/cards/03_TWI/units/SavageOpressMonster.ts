import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SavageOpressMonster extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8540765053',
            internalName: 'savage-opress#monster',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Ready this unit.',
            immediateEffect: AbilityHelper.immediateEffects.conditional(
                {
                    condition: (context) => {
                        const player = context.player;
                        const opponent = player.opponent;
                        return player.getArenaUnits().length < opponent.getArenaUnits().length;
                    },
                    onTrue: AbilityHelper.immediateEffects.ready(),
                }
            )
        });
    }
}
