import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { ZoneName } from '../../../core/Constants';

export default class Masterstroke extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'masterstroke-id',
            internalName: 'masterstroke',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each unit the defending player controls in its arena.',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack({
                    attackerLastingEffects: (context, attack) => ({
                        effect: abilityHelper.ongoingEffects.modifyStats({
                            power: attack.getDefendingPlayer().getArenaUnits({ arena: attack.attacker.zoneName as ZoneName.GroundArena | ZoneName.SpaceArena }).length,
                            hp: 0,
                        })
                    })
                })
            }
        });
    }
}