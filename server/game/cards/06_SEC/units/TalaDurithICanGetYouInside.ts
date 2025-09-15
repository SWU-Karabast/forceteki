import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName } from '../../../core/Constants';


export default class TalaDurithICanGetYouInside extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'tala-durith#i-can-get-you-inside-id',
            internalName: 'tala-durith#i-can-get-you-inside'
        };
    }


    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Each other friendly unit gains Hidden.',
            matchTarget: (card, context) => card !== context.source && card.isUnit(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Hidden })
        });
    }
}
