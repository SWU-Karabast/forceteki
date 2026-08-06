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
            title: 'Ready Kachirho Militia',
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onAttackDeclared: (event, context) =>
                    event.attackerLastKnownInformation.controller !== context.player &&
                    event.attackerLastKnownInformation.arena === ZoneName.GroundArena &&
                    event.attack.getAllTargets().some((target) => target.isBase()),
            },
            immediateEffect: AbilityHelper.immediateEffects.ready(),
        });
    }
}