import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { DamageSourceType } from '../../../IDamageOrDefeatSource';

export default class JangoFettConcealingTheConspiracy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9155536481',
            internalName: 'jango-fett#concealing-the-conspiracy',
        };
    }

    protected override setupLeaderSideAbilities() {
        // When a friendly unit deals damage to an enemy unit:
        //     You may exhaust this leader.
        //     If you do, exhaust that enemy unit.
        this.addTriggeredAbility({
            title: 'Exhaust this leader',
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.isEnemyUnitDamagedByFriendlyUnit(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Exhaust the damaged enemy unit',
                immediateEffect: AbilityHelper.immediateEffects.exhaust(
                    { target: ifYouDoContext.event.card }
                )
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        // When a friendly unit deals damage to an enemy unit:
        //     You may exhaust that unit.
        this.addTriggeredAbility({
            title: 'Exhaust the damaged enemy unit',
            optional: true,
            when: {
                onDamageDealt: (event, context) => this.isEnemyUnitDamagedByFriendlyUnit(event, context)
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust((context) => {
                return { target: context.event.card };
            })
        });
    }

    private isEnemyUnitDamagedByFriendlyUnit(event, context): boolean {
        // If an enemy unit received the damage
        if (event.card.isUnit() && event.card.controller !== context.player) {
            switch (event.damageSource.type) {
                case DamageSourceType.Ability:
                    // If the damage was dealt by a friendly unit via an ability
                    return event.damageSource.card.isUnit() &&
                      event.damageSource.player === context.source.controller;

                case DamageSourceType.Attack:
                    // If the damage was dealt by a friendly unit via combat
                    return event.damageSource.damageDealtBy.isUnit() &&
                      event.damageSource.damageDealtBy.controller === context.player;
            }
        }

        return false;
    }
}