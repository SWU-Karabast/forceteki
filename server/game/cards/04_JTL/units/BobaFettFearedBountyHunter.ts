import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType, Trait, WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class BobaFettFearedBountyHunter extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7700932371',
            internalName: 'boba-fett#feared-bounty-hunter',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Deal 1 damage to a unit. If attached unit is a Transport, deal 2 damage instead.',
            when: {
                whenPlayed: true,
            },
            optional: true,
            targetResolver: {
                activePromptTitle: (context) => `Choose a unit to deal ${context.source.parentCard.hasSomeTrait(Trait.Transport) ? '2' : '1'} damage to`,
                controller: WildcardRelativePlayer.Any,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.source.parentCard.hasSomeTrait(Trait.Transport) ? 2 : 1,
                }))
            }
        });
    }
}