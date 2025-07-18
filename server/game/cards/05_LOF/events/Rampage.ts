import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait } from '../../../core/Constants';

export default class Rampage extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8241022502',
            internalName: 'rampage',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give all friendly Creature units +2/+2 for the phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                target: context.player.getArenaUnits({ trait: Trait.Creature }),
                effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
            }))
        });
    }
}
