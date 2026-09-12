import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class FambaaShieldTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'fambaa-shield-team-id',
            internalName: 'fambaa-shield-team',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to each friendly ground unit without a Shield token on it',
            immediateEffect: abilityHelper.immediateEffects.giveShield((context) => ({
                target: context.player.getArenaUnits({ arena: ZoneName.GroundArena, condition: (c) => c.isUnit() && !c.upgrades.some((u) => u.isShield()) })
            }))
        });
    }
}