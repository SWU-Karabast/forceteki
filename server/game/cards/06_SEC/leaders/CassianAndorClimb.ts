import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityRestriction } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class CassianAndorClimb extends LeaderUnitCard {
    private damageDealtWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8015738064',
            internalName: 'cassian-andor#climb',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.damageDealtWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities(
        registrar: ILeaderUnitLeaderSideAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addConstantAbility({
            title: 'Friendly units that have damaged an opponent\'s base this phase can\'t be attacked',
            matchTarget: (card, context) =>
                card.isUnit() &&
                card.controller === context.player &&
                this.damageDealtWatcher.unitHasDealtDamage(card, (filter) =>
                    filter.targets.some((c) => c.isBase() && c.owner !== context.player)
                ),
            ongoingEffect: AbilityHelper.ongoingEffects.cardCannot(AbilityRestriction.BeAttacked)
        });
    }

    protected override setupLeaderUnitSideAbilities(
        registrar: ILeaderUnitAbilityRegistrar,
        AbilityHelper: IAbilityHelper
    ) {
        registrar.addConstantAbility({
            title: 'While you have the initiative, this unit isn\'t defeated by having no remaining HP',
            condition: (context) => context.player.hasInitiative(),
            ongoingEffect: AbilityHelper.ongoingEffects.cannotBeDefeatedByDamage(),
        });

        registrar.addReplacementEffectAbility({
            title: 'While you have the initiative, this unit can\'t be defeated by enemy card abilities',
            when: {
                onCardDefeated: (event, context) =>
                    context.player.hasInitiative() &&
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player
            }
        });
    }
}
