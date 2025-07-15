import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType, KeywordName } from '../../../core/Constants';

export default class Overpower extends EventCard {
    protected override getImplementationId() {
        return {
            id: '5049217986',
            internalName: 'overpower',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Give a unit +3/+3 and overwhelm for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                    }),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 3, hp: 3 }),
                    }),
                ])
            }
        });
    }
}