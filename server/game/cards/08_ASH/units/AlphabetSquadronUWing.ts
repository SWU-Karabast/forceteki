import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { PhaseName, WildcardCardType } from '../../../core/Constants';

export default class AlphabetSquadronUWing extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'alphabet-squadron-uwing#quiet-devotion-id',
            internalName: 'alphabet-squadron-uwing#quiet-devotion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to a unit',
            when: {
                onPhaseStarted: (context) => context.phase === PhaseName.Regroup
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage()
            }
        });
    }
}
