import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TheGhostWhaleWatching extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'the-ghost#whale-watching-id',
            internalName: 'the-ghost#whale-watching',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'If you have 7 or fewer cards in your hand, draw a card',
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.isEnemyBaseDamagedByFriendlyUnit(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.hand.length <= 7,
                onTrue: AbilityHelper.immediateEffects.draw(),
            })
        });
    }

    private isEnemyBaseDamagedByFriendlyUnit(event, context): boolean {
        // If an enemy base received the damage and If the damage was dealt by a friendly unit
        if (event.card.isBase() && event.card.controller !== context.player) {
            return event.damageSource.damageDealtBy.some((card) => card.isUnit()) &&
              event.damageSource.damageDealtBy.some((unit) => unit.controller === context.player);
        }

        return false;
    }
}