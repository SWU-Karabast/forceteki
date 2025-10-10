import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityType, KeywordName, Trait, WildcardCardType } from '../../../core/Constants';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class Implicate extends EventCard {
    protected override getImplementationId() {
        return {
            id: 'implicate-id',
            internalName: 'implicate',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Choose a unit.  For this phase, it gains Sentinel and :When this unit is attacked: Create a Spy token"',
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
