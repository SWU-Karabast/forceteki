import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { DamageType, KeywordName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class FlashTheVents extends EventCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3438557190',
            internalName: 'flash-the-vents',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Attack with a unit. It gets +2/+0 and gains Overwhelm for this attack. After completing this attack, if that unit damaged a base, defeat that unit.',
            initiateAttack: {
                attackerLastingEffects: {
                    effect: [
                        AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                        AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Overwhelm),
                    ]
                },
            },
            // TODO: Use after instead of then when it's implemented
            then: (thenContext) => ({
                title: `Defeat ${thenContext.target.title}`,
                thenCondition: () => this.damageDealtThisPhaseWatcher.unitHasDealtDamage(
                    thenContext.target,
                    (entry) => entry.activeAttackId === thenContext.activeAttackId &&
                      (entry.targets.some((target) => target.isBase()) || entry.damageType === DamageType.Overwhelm)
                ),
                immediateEffect: AbilityHelper.immediateEffects.defeat({ target: thenContext.target })
            })
        });
    }
}
