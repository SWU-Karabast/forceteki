import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { AbilityContext } from '../../../core/ability/AbilityContext';

export default class Masterstroke extends EventCard {
    protected override getImplementationId () {
        return {
            id: 'masterstroke-id',
            internalName: 'masterstroke',
        };
    }

    private getPowerFromContext(context: AbilityContext): number {
        const arenaName = context.target.zoneName;
        const arena = context.player.opponent.getArenaUnits({ arena: arenaName });
        return arena.length;
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +1/+0 for this attack for each unit the defending player controls in its arena.',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.attack({
                    attackerLastingEffects: (context) => ({
                        effect: abilityHelper.ongoingEffects.modifyStats({
                            power: this.getPowerFromContext(context),
                            hp: 0,
                        })
                    })
                })
            }
        });
    }
}