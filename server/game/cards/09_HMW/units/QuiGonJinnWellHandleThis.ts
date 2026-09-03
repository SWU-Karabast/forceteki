import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class QuiGonJinnWellHandleThis extends NonLeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'quigon-jinn#well-handle-this-id',
            internalName: 'quigon-jinn#well-handle-this',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, abilityHelper: IAbilityHelper): void {
        this.attacksThisPhaseWatcher = abilityHelper.stateWatchers.attacksThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Defeat a unit that attacked your base this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) =>
                    this.attacksThisPhaseWatcher
                        .getAttackersInPlay((entry) => entry.targets.includes(context.player.base))
                        .includes(card),
                immediateEffect: abilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Defeat this unit',
                ifYouDoCondition: () => EnumHelpers.isLeaderUnit(ifYouDoContext.events[0].lastKnownInformation.type),
                immediateEffect: abilityHelper.immediateEffects.defeat((context) => ({ target: context.source }))
            })
        });
    }
}
