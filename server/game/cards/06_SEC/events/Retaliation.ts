import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class Retaliation extends EventCard {
    private damageDealtWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '1095143323',
            internalName: 'retaliation',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Defeat a unit that dealt damage to a base this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => {
                    return this.damageDealtWatcher.cardHasDealtDamage(card, (filter) => filter.targets.some((c) => c.isBase()));
                },
                immediateEffect: AbilityHelper.immediateEffects.defeat(),
            }
        });
    }
}
