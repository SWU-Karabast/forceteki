import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait, ZoneName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BoKatanKryzeReclaimingMandalore extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9315814672',
            internalName: 'bokatan-kryze#reclaiming-mandalore',
        };
    }

    protected override deployActionAbilityProps() {
        return {
            condition: (context) => (context.player.resources.length + context.player.getArenaUnits({ condition: (c) => c.hasSomeTrait(Trait.Mandalorian) }).length) >= 10
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Create a Mandalorian token',
            cost: [abilityHelper.costs.abilityActivationResourceCost(2), abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }) && context.player.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                onTrue: abilityHelper.immediateEffects.createMandalorian()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: `Other friendly ${TextHelper.Trait.Mandalorian} units gets +1/+0`,
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Mandalorian),
            ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
        });

        registrar.addOnAttackAbility({
            title: 'Create a Mandalorian token',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ arena: ZoneName.GroundArena }) && context.player.hasSomeArenaUnit({ arena: ZoneName.SpaceArena }),
                onTrue: abilityHelper.immediateEffects.createMandalorian()
            })
        });
    }
}
