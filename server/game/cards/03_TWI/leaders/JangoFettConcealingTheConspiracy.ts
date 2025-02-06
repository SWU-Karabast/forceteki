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
        if (event.card.isUnit() && event.card.controller !== context.source.controller) {
            console.log('----------------------');
            console.log(`[Damage Recieved] ${event.card.title}`);

            if (
                event.damageSource.type === DamageSourceType.Ability &&
                event.damageSource.card.isUnit() &&
                event.damageSource.player === context.source.controller
            ) {
                console.log(`[Ability Damage Source] ${event.damageSource.card.title}`);
                return true;
            }

            if (
                event.damageSource.type === DamageSourceType.Attack &&
                event.damageSource.damageDealtBy.isUnit() &&
                event.damageSource.damageDealtBy.controller === context.source.controller
            ) {
                console.log(`[Attack Damage Source] ${event.damageSource.damageDealtBy.title}`);
                return true;
            }
        }

        return false;
    }
}