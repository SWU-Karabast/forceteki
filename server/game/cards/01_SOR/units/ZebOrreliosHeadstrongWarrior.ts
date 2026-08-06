import type { IAbilityHelper } from '../../../AbilityHelper';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class ZebOrreliosHeadstrongWarrior extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9647945674',
            internalName: 'zeb-orrelios#headstrong-warrior'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'If the defender was defeated, you may deal 4 damage to a ground unit',
            optional: true,
            attackerMustSurvive: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.cardsDefeatedThisPhaseWatcher),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 4 }),
                })
            }
        });
    }
}
