import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class PoliticalBully extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5668757769',
            internalName: 'political-bully',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If you control another Official unit, you may deal 2 damage to a ground unit',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.Official, otherThan: context.source }),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    zoneFilter: ZoneName.GroundArena,
                    immediateEffect: abilityHelper.immediateEffects.damage({ amount: 2 })
                })
            })
        });
    }
}
