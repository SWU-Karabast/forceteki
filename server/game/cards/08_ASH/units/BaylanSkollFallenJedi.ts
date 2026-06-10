import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class BaylanSkollFallenJedi extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8242761292',
            internalName: 'baylan-skoll#fallen-jedi',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Give an Advantage token to a unit and/or exhaust a unit',
            when: {
                whenPlayed: true,
                onAttackEnd: (event, context) => event.attack.attacker === context.source,
            },
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.enemyBaseDamagedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Give an Advantage token to a unit',
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.giveAdvantage({ amount: 1 }),
                    }),
                }),
                AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.friendlyUpgradeDefeatedThisPhase(context),
                    onTrue: AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Exhaust a unit',
                        optional: true,
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.exhaust(),
                    }),
                }),
            ]),
        });
    }

    private enemyBaseDamagedThisPhase(context): boolean {
        return this.damageDealtThisPhaseWatcher.getCurrentValue().some(
            (entry) =>
                entry.amount > 0 &&
                entry.targets.some((target) =>
                    target.isBase() &&
                    target.controller !== context.player
                )
        );
    }

    private friendlyUpgradeDefeatedThisPhase(context): boolean {
        return this.cardsDefeatedThisPhaseWatcher.someUpgradeDefeatedThisPhase({ controller: context.player });
    }
}
