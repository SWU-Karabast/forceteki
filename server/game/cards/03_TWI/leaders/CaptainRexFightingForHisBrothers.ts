import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class CaptainRexFightingForHisBrothers extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7734824762',
            internalName: 'captain-rex#fighting-for-his-brothers',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'If a friendly unit attacked this phase, create a Clone Trooper token.',
            cost: [AbilityHelper.costs.abilityResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.attacksThisPhaseWatcher.someUnitAttackedControlledByPlayer({
                    controller: context.source.controller,
                    filter: (_attack) => true
                }),
                onTrue: AbilityHelper.immediateEffects.createCloneTrooper(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Create a Clone Trooper token.',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });

        this.addConstantAbility({
            title: 'Each other friendly Trooper unit gets +0/+1.',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Trooper),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}

CaptainRexFightingForHisBrothers.implemented = true;