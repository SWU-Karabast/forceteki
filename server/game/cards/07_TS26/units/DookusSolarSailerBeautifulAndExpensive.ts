import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { BasesHealedThisPhaseWatcher } from '../../../stateWatchers/BasesHealedThisPhaseWatcher';

export default class DookusSolarSailerBeautifulAndExpensive extends NonLeaderUnitCard {
    private basesHealedThisPhaseWatcher: BasesHealedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'dookus-solar-sailer#beautiful-and-expensive-id',
            internalName: 'dookus-solar-sailer#beautiful-and-expensive',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.basesHealedThisPhaseWatcher = AbilityHelper.stateWatchers.basesHealedThisPhase();
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Experience token to another Separatist unit',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source && card.hasSomeTrait(Trait.Separatist),
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: () => this.basesHealedThisPhaseWatcher.getCurrentValue().length > 0,
                    onTrue: abilityHelper.immediateEffects.giveExperience()
                })
            }
        });
    }
}