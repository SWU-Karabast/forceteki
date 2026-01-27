import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';

export default class CommonCause extends EventCard {
    protected override getImplementationId () {
        return {
            id: '4006503809',
            internalName: 'common-cause',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give a unit +1/+1 for this phase for each different aspect among units you control',
            targetResolver: {
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => {
                    const differentAspectCount = new Set(context.player.getArenaUnits().flatMap((x) => x.aspects)).size;
                    return { effect: abilityHelper.ongoingEffects.modifyStats({
                        power: differentAspectCount,
                        hp: differentAspectCount,
                    }) };
                })
            }
        });
    }
}