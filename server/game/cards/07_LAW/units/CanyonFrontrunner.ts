import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import { WildcardCardType } from '../../../core/Constants';

export default class CanyonFrontrunner extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9069708911',
            internalName: 'canyon-frontrunner',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Give a unit –2/–0 for this phase',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: () => this.attacksThisPhaseWatcher.getCurrentValue().length === 1,
                onTrue: abilityHelper.immediateEffects.selectCard({
                    cardTypeFilter: WildcardCardType.Unit,
                    optional: true,
                    immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                        effect: abilityHelper.ongoingEffects.modifyStats({ power: -2, hp: 0 })
                    })
                })
            })
        });
    }
}