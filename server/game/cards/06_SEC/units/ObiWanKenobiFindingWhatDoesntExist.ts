import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class ObiWanKenobiFindingWhatDoesntExist extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9388438736',
            internalName: 'obiwan-kenobi#finding-what-doesnt-exist',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Discard a card from the defending player\'s deck. For this phase, you may play that card from their discard pile, ignoring its aspect penalties.',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: abilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.source.activeAttack.getDefendingPlayer(),
            })),
            ifYouDo: (ifYouDoContext) => ({
                title: 'For this phase, you may play the discarded card, ignoring its aspect penalties',
                immediateEffect: abilityHelper.immediateEffects.simultaneous([
                    abilityHelper.immediateEffects.forThisPhaseCardEffect((context) => ({
                        target: ifYouDoContext.events[0].card,
                        effect: abilityHelper.ongoingEffects.canPlayFromDiscard({
                            player: context.player,
                        })
                    })),
                    abilityHelper.immediateEffects.forThisPhasePlayerEffect((context) => ({
                        effect: abilityHelper.ongoingEffects.ignoreAllAspectPenalties({
                            match: (card) => card === ifYouDoContext.events[0].card
                        }),
                        target: context.player,
                    }))
                ])
            })
        });
    }
}
