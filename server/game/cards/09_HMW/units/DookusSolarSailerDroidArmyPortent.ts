import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DookusSolarSailerDroidArmyPortent extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'dookus-solar-sailer#droid-army-portent-id',
            internalName: 'dookus-solar-sailer#droid-army-portent',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Each opponent discards a card from their hand',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hasSomeArenaUnit({ condition: (c) => c.hasCost() && c.cost <= 1 }),
                onTrue: abilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                    target: context.player.opponent,
                    amount: 1
                }))
            })
        });
    }
}