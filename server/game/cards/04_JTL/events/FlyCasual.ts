import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class FlyCasual extends EventCard {
    protected override getImplementationId () {
        return {
            id: '2948553808',
            internalName: 'fly-casual',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a Vehicle unit. It can\'t attack bases for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.hasSomeTrait(Trait.Vehicle),
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.ready(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: AbilityHelper.ongoingEffects.cannotAttackBase()
                    })
                ])
            },
        });
    }
}
