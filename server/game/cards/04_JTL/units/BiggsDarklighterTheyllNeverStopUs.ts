import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';

export default class BiggsDarklighterTheyllNeverStopUs extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '2633842896',
            internalName: 'biggs-darklighter#theyll-never-stop-us',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addPilotingGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeTrait(Trait.Fighter),
            keyword: KeywordName.Overwhelm
        });

        registrar.addPilotingGainKeywordTargetingAttached({
            gainCondition: (context) => context.source.parentCard.hasSomeTrait(Trait.Speeder),
            keyword: KeywordName.Grit,
        });

        registrar.addPilotingConstantAbilityTargetingAttached({
            title: 'Transport attached unit gets +0/+1',
            condition: (context) => context.source.parentCard.hasSomeTrait(Trait.Transport),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({
                hp: 1, power: 0
            }),
        });
    }
}
