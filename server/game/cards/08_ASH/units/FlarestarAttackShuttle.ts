import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class FlarestarAttackShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7534790849',
            internalName: 'flarestar-attack-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to a unit.',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                            cardTypeFilter: WildcardCardType.Unit,
                            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({ amount: 1
                            })
                    }
        });
    }
}