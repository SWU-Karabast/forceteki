import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class PoggleTheLesserArchdukeOfTheStalgasinHive extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9610332938',
            internalName: 'poggle-the-lesser#archduke-of-the-stalgasin-hive',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this unit to create a Battle Droid token',
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player &&
                    event.card !== context.source
            },
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Create a Battle Droid token',
                immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
            }
        });
    }
}

