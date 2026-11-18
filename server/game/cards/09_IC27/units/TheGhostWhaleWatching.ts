import type { IAbilityHelper } from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class TheGhostWhaleWatching extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '6105987112',
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
            switch (event.damageSource.type) {
                case DamageSourceType.Ability:
                    // TODO: event.damageSource.controller will eventually be non-optional
                    const controller = event.damageSource.controller ?? event.damageSource.card.controller;
                    // If the damage was dealt by a friendly unit via an ability
                    return event.damageSource.card.isUnit() && controller === context.player;

                case DamageSourceType.Attack:
                    // If the damage was dealt by a friendly unit via combat
                    return event.damageSource.damageDealtBy.some((card) => card.isUnit()) &&
                      event.damageSource.damageDealtBy.some((unit) => unit.controller === context.player);
            }
            return event.damageSource.damageDealtBy.some((card) => card.isUnit() && card.controller === context.player);
        }

        return false;
    }
}