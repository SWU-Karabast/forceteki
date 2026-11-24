import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class NegotiatorPrepareTheTroops extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5865630947',
            internalName: 'negotiator#prepare-the-troops',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Resource the top card of your deck. Then, you may return a friendly resource to its owner\'s hand',
            when: {
                onAttack: true,
                whenDefeated: true,
            },
            immediateEffect: abilityHelper.immediateEffects.resourceCard((context) => ({ target: context.player.getTopCardOfDeck() })),
            then: {
                title: 'Return a friendly resource to its owner\'s hand',
                optional: true,
                targetResolver: {
                    zoneFilter: ZoneName.Resource,
                    controller: RelativePlayer.Self,
                    immediateEffect: abilityHelper.immediateEffects.returnToHand()
                }
            }
        });
    }
}
