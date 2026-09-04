import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class BuyTime extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6201936455',
            internalName: 'buy-time',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Create a Mandalorian token and give it ${TextHelper.Sentinel} for this Phase`,
            immediateEffect: AbilityHelper.immediateEffects.createMandalorian((context) => ({ amount: 1, target: context.player })),
            then: (thenContext) => ({
                title: `Give it ${TextHelper.Sentinel} for this phase`,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: thenContext.resolvedEvents[0]?.generatedTokens
                })
            })
        });
    }
}