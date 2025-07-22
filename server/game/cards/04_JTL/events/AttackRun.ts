import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { ZoneName } from '../../../core/Constants';

export default class AttackRun extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1355075014',
            internalName: 'attack-run',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with 2 space units (one at a time)',
            targetResolver: {
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: AbilityHelper.immediateEffects.attack()
            },
            then: (thenContext) => ({
                title: 'Attack with another unit',
                initiateAttack: {
                    attackerCondition: (card) => thenContext.target !== card && card.zone.name === ZoneName.SpaceArena
                }
            })
        });
    }
}
