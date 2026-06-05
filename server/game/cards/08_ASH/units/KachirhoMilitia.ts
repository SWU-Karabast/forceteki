import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class KachirhoMilitia extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6989468664',
            internalName: 'kachirho-militia'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Ready when an enemy ground unit attacks base',
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onAttackDeclared: (event, context) =>
                    event.attack.attacker.controller !== context.player &&
                    event.attack.attacker.zoneName === ZoneName.GroundArena &&
                    event.attack.getAllTargets().some((target) => target.isBase()),
            },
            immediateEffect: AbilityHelper.immediateEffects.ready(),
        });
    }
}