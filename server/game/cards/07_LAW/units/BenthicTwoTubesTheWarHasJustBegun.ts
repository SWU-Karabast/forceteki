import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class BenthicTwoTubesTheWarHasJustBegun extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3026579497',
            internalName: 'benthic-two-tubes#the-war-has-just-begun',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to an enemy ground unit',
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            },
        });
        registrar.addWhenDefeatedAbility({
            title: 'Deal 1 damage to a base',
            targetResolver: {
                cardCondition: (card) => card.isBase(),
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}