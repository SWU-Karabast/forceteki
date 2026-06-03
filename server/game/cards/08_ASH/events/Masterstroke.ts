import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class Masterstroke extends EventCard {
    protected override getImplementationId () {
        return {
            id: '6315733621',
            internalName: 'masterstroke',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each unit the defending player controls in its arena.',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack({
                    attackerLastingEffects: (context, attack) => {
                        const arena = attack.attacker.zoneName;
                        const total = EnumHelpers.isArena(arena)
                            ? attack.getDefendingPlayer().getArenaUnits({ arena }).length
                            : 0;

                        return {
                            effect: abilityHelper.ongoingEffects.modifyStats({
                                power: total,
                                hp: 0
                            })
                        };
                    }
                })
            }
        });
    }
}