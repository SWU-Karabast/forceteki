import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class AssassinProbe extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6916352335',
            internalName: 'assassin-probe'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Deal 1 damage to each exhausted enemy ground unit',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.player.opponent.getArenaUnits({ arena: ZoneName.GroundArena, condition: (card) => card.isUnit() && card.exhausted }),
            }))
        });
    }
}