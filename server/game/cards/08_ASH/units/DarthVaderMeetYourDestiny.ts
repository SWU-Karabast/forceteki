import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';

export default class DarthVaderMeetYourDestiny extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'darth-vader#meet-your-destiny-id',
            internalName: 'darth-vader#meet-your-destiny',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While this unit is ready, it gains Sentinel',
            condition: (context) => !context.source.exhausted,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Sentinel)
        });
    }
}