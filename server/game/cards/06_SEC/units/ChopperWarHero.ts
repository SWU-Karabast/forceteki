import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class ChopperWarHero extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4136536221',
            internalName: 'chopper#war-hero',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Each player discards a card from their hand',
            when: {
                onDamageDealt: (event, context) =>
                    // TODO: refactor damage enum types to account for the fact that overwhelm is combat damage
                    event.damageSource?.attack?.attacker === context.source &&
                    ((event.type === DamageType.Combat && event.damageSource.attack.getAllTargets().some((target) => target.isBase())) || event.type === DamageType.Overwhelm)
            },
            immediateEffect: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                target: context.game.getPlayers(),
                amount: 1
            }))
        });
    }
}
