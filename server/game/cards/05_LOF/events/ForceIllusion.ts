import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ForceIllusion extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'force-illusion-id',
            internalName: 'force-illusion',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Exhaust an enemy unit. A friendly unit gains Sentinel for this phase',
            immediateEffect: AbilityHelper.immediateEffects.sequential([
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Exhaust an enemy unit',
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.exhaust()
                }),
                AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'A friendly unit gains Sentinel for this phase',
                    controller: RelativePlayer.Self,
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    })
                }),
            ]),
        });
    }
}
