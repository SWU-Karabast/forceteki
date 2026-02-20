import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class ChirrutImweIDontNeedLuck extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5539492404',
            internalName: 'chirrut-imwe#i-dont-need-luck',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If Chirrut Imwe dealt combat damage to a base, you may heal 4 damage from another unit',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    this.damageDealtThisPhaseWatcher.unitHasDealtDamage(
                        context.source,
                        (entry) =>
                            entry.combatDamageAttackId === context.event.attack.id &&
                            ((entry.damageType === DamageType.Combat && entry.targets.some((target) => target.isBase())) || entry.damageType === DamageType.Overwhelm)
                    ),
                onTrue: AbilityHelper.immediateEffects.selectCard({
                    activePromptTitle: 'Select a unit to heal 4 damage from',
                    cardTypeFilter: WildcardCardType.Unit,
                    cardCondition: (card, context) => card !== context.source,
                    optional: true,
                    immediateEffect: AbilityHelper.immediateEffects.heal({ amount: 4 }),
                })
            })
        });
    }
}
