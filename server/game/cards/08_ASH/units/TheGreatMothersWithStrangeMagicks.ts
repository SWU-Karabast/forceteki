import type { IAbilityHelper } from '../../../AbilityHelper';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { Card } from '../../../core/card/Card';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IUnitCard } from '../../../core/card/propertyMixins/UnitProperties';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class TheGreatMothersWithStrangeMagicks extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'the-great-mothers#with-strange-magicks-id',
            internalName: 'the-great-mothers#with-strange-magicks',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenAttackEndsAbility({
            title: 'Defeat the defending units',
            contextTitle: (context) => this.buildDefeatDefendersTitle(context),
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => {
                const damagedNonLeaderUnits = this.getDamagedNonLeaderDefendingUnits(context.source, context);

                return {
                    condition: () => damagedNonLeaderUnits.length > 0,
                    onTrue: AbilityHelper.immediateEffects.defeat({
                        target: damagedNonLeaderUnits
                    })
                };
            })
        });
    }

    private buildDefeatDefendersTitle(context: TriggeredAbilityContext<NonLeaderUnitCard>): string {
        const damagedNonLeaderUnits = this.getDamagedNonLeaderDefendingUnits(context.source, context);

        if (damagedNonLeaderUnits.length === 0) {
            return 'Defeat the defending units';
        }

        return `Defeat ${this.formatCardTitles(damagedNonLeaderUnits)}`;
    }

    private getDamagedNonLeaderDefendingUnits(source: IUnitCard, context: TriggeredAbilityContext): Card[] {
        return Array.from(new Set(this.damageDealtThisPhaseWatcher.getNonLeaderUnitsDealtCombatDamageByUnitThisAttack(source, context)));
    }

    private formatCardTitles(cards: Card[]): string {
        if (cards.length === 1) {
            return cards[0].title;
        }

        return `${cards.slice(0, -1).map((card) => card.title)
            .join(', ')} and ${cards[cards.length - 1].title}`;
    }
}
