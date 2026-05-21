import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName, Trait } from '../../../core/Constants';

export default class RexsDC17sThisShipIsGoingDown extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '4781765221',
            internalName: 'rexs-dc17s#this-ship-is-going-down',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.setAttachCondition((context) => !context.attachTarget.hasSomeTrait(Trait.Vehicle));

        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Ready this unit',
            contextTitle: (context) => `Ready ${context.source.title}`,
            limit: AbilityHelper.limit.perRound(1),
            when: {
                onCardReadied: (event, context) => // When an enemy unit readies during the action phase
                    context.game.currentPhase === PhaseName.Action &&
                    event.card.isUnit() &&
                    event.card.controller !== context.player
            },
            immediateEffect: AbilityHelper.immediateEffects.ready()
        });
    }
}