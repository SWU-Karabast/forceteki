import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityType, KeywordName, WildcardCardType } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Implicate extends EventCard {
    protected override getImplementationId() {
        return {
            id: '7737958693',
            internalName: 'implicate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: `Choose a unit. For this phase, it gains ${TextHelper.Sentinel} and When this unit is attacked: Create a Spy token"`,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                    effect: [
                        AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Sentinel }),
                        AbilityHelper.ongoingEffects.gainAbility({
                            type: AbilityType.Triggered,
                            title: 'Create a Spy token',
                            when: {
                                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
                            },
                            immediateEffect: AbilityHelper.immediateEffects.createSpy()
                        })
                    ]
                }))
            }
        });
    }
}
