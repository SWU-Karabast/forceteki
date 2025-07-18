import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, WildcardCardType } from '../../../core/Constants';

export default class GuardingTheWay extends EventCard {
    protected override getImplementationId() {
        return {
            id: '2359136621',
            internalName: 'guarding-the-way',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give Sentinel for the phase. If you have the initiative, also give that unit +2/+2 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
                    }),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.player.hasInitiative(),
                        onTrue: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                            effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                        }),
                    })
                ])
            }
        });
    }
}
