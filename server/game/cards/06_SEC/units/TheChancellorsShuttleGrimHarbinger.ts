import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class TheChancellorsShuttleGrimHarbinger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3052170248',
            internalName: 'the-chancellors-shuttle#grim-harbinger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to a unit.',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.controlsLeaderUnitOrUpgradeWithTitle('Chancellor Palpatine'),
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    immediateEffect: abilityHelper.immediateEffects.giveExperience(),
                })
            })
        });
    }
}
