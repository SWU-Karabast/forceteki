import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class LowAltitudeCombat extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'low-altitude-combat-id',
            internalName: 'low-altitude-combat',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Move a space unit to the ground arena. If you do, you may attack with a ground unit. It gets +2/+0 for this attack.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.zoneName === ZoneName.SpaceArena,
                immediateEffect: abilityHelper.immediateEffects.moveUnitFromSpaceToGround()
            },
            ifYouDo: {
                title: 'Attack with a ground unit. It gets +2/+0 for this attack.',
                optional: true,
                initiateAttack: {
                    attackerCondition: (card) => card.zoneName === ZoneName.GroundArena,
                    attackerLastingEffects: {
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }
                }
            }
        });
    }
}