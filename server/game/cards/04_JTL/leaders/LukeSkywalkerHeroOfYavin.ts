import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { AbilityType, Trait, WildcardCardType, WildcardZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { DefeatSourceType } from '../../../IDamageOrDefeatSource';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class LukeSkywalkerHeroOfYavin extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '0766281795',
            internalName: 'luke-skywalker#hero-of-yavin',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar): void {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addPilotDeploy();

        this.addActionAbility({
            title: 'If you attacked with a Fighter unit this phase, deal 1 damage to a unit',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                        controller: context.player,
                        filter: (attack) => context.source !== attack.attacker && attack.attacker.hasSomeTrait(Trait.Fighter)
                    }),
                    onTrue: AbilityHelper.immediateEffects.damage({ amount: 1 }),
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addPilotingAbility({
            type: AbilityType.ReplacementEffect,
            title: 'This upgrade can\'t be defeated by enemy card abilities',
            zoneFilter: WildcardZoneName.AnyArena,
            when: {
                onCardDefeated: (event, context) =>
                    event.card === context.source &&
                    event.defeatSource.type === DefeatSourceType.Ability &&
                    event.defeatSource.player !== context.player
            }
        });

        this.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Deal 3 damage to a unit',
            optional: true,
            gainCondition: (context) => context.source.parentCard.hasSomeTrait(Trait.Fighter),
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 3 })
            }
        });
    }
}