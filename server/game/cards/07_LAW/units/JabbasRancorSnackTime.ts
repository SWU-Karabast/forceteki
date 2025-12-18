import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';

export default class JabbasRancorSnackTime extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jabbas-rancor#snack-time-id',
            internalName: 'jabbas-rancor#snack-time',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'An opponent chooses a ground unit they control. You may deal 7 damage to that unit',
            targetResolver: {
                activePromptTitle: 'Choose a ground unit. Your opponent may deal 7 damage to it',
                controller: RelativePlayer.Opponent,
                choosingPlayer: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
            },
            then: (context) => ({
                title: `Deal 7 damage to ${context.target.title}`,
                optional: true,
                immediateEffect: abilityHelper.immediateEffects.damage({
                    target: context.target,
                    amount: 7,
                }),
            })
        });
    }
}
