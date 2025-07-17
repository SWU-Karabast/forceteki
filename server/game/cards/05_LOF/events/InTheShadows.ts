import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { KeywordName, TargetMode, RelativePlayer } from '../../../core/Constants';

export default class InTheShadows extends EventCard {
    protected override getImplementationId() {
        return {
            id: '6553590382',
            internalName: 'in-the-shadows',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Give an Experience token to up to 3 friendly units with Hidden',
            targetResolver: {
                mode: TargetMode.UpTo,
                numCards: 3,
                controller: RelativePlayer.Self,
                cardCondition: (card) => card.hasSomeKeyword(KeywordName.Hidden),
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
