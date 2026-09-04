import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName } from '../../../core/Constants';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class TimelyReinforcements extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2301911685',
            internalName: 'timely-reinforcements',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'For every 2 resources your opponent control, create an X-Wing token.',
            immediateEffect: AbilityHelper.immediateEffects.createXWing((context) => ({
                amount: Math.floor(context.player.opponent.resources.length / 2),
                target: context.player,
            })),
            then: (thenContext) => ({
                title: `Give them ${TextHelper.Sentinel} for this phase`,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                    target: thenContext.resolvedEvents[0]?.generatedTokens
                })
            })
        });
    }
}

