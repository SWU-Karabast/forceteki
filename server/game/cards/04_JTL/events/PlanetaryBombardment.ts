import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TargetMode, Trait } from '../../../core/Constants';

export default class PlanetaryBombardment extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0425156332',
            internalName: 'planetary-bombardment',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Deal 8 indirect damage to a player. If you control a Capital Ship unit, deal 12 indirect damage instead',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.hasSomeArenaUnit({ trait: Trait.CapitalShip }),
                    onTrue: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 12 }),
                    onFalse: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 8 })
                })
            }
        });
    }
}
