import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { KeywordName, TargetMode, WildcardCardType } from '../../../core/Constants';

export default class PlanetaryInvasion extends EventCard {
    protected override getImplementationId() {
        return {
            id: '1167572655',
            internalName: 'planetary-invasion',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready up to 3 units. Each of those units gets +1/+0 and gains Overwhelm for this phase.',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    AbilityHelper.immediateEffects.ready(),
                    AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: [
                            AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 }),
                            AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm)
                        ]
                    })
                ])
            }
        });
    }
}
