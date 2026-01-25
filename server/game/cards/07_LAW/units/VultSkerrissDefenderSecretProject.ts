import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
import type { CardsDiscardedThisPhaseWatcher } from '../../../stateWatchers/CardsDiscardedThisPhaseWatcher';

export default class VultSkerrissDefenderSecretProject extends NonLeaderUnitCard {
    private cardsDiscardedThisPhaseWatcher: CardsDiscardedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'vult-skerriss-defender#secret-project-id',
            internalName: 'vult-skerriss-defender#secret-project',
        };
    }

    protected override setupStateWatchers (_, abilityHelper: IAbilityHelper): void {
        this.cardsDiscardedThisPhaseWatcher = abilityHelper.stateWatchers.cardsDiscardedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give a Shield token to this unit',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsDiscardedThisPhaseWatcher.getCurrentValue().some((x) => x.discardedFromPlayer === context.player && (x.discardedFromZone === ZoneName.Hand || x.discardedFromZone === ZoneName.Deck)),
                onTrue: abilityHelper.immediateEffects.giveShield()
            })
        });

        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to a space unit and exhaust it',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.SpaceArena,
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.damage({ amount: 1 }),
                    abilityHelper.immediateEffects.exhaust()
                ])
            }
        });
    }
}