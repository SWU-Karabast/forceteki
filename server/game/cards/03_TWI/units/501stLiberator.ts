import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, ZoneName } from '../../../core/Constants';

export default class _501stLiberator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7252148824',
            internalName: '501st-liberator',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 3 damage from a base.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Base,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.isTraitInPlay(Trait.Republic, context.source),
                    onTrue: AbilityHelper.immediateEffects.heal({ amount: 3 }),
                }),
            }
        });
    }
}
