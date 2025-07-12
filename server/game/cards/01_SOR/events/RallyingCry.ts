import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';

export default class RallyingCry extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1208707254',
            internalName: 'rallying-cry',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Each friendly unit gains Raid 2 this phase',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 2 }),
                target: context.player.getArenaUnits()
            }))
        });
    }
}
