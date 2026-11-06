import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { AbilityType, RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class JabbaTheHuttBountiesLeftAndRight extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'jabba-the-hutt#bounties-left-and-right-id',
            internalName: 'jabba-the-hutt#bounties-left-and-right',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Choose an enemy unit. For this phase, while that unit is defending, the attacker gets +4/+0',
            cost: [abilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: abilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: abilityHelper.ongoingEffects.gainAbility({
                        type: AbilityType.Constant,
                        title: 'While this unit is defending, the attacker gets +4/+0',
                        targetController: RelativePlayer.Opponent,
                        matchTarget: (card, context) =>
                            card.isUnit() && card.isInPlay() && card.isAttacking() &&
                            context.source.isUnit() && card.activeAttack.getAllTargets().includes(context.source),
                        ongoingEffect: abilityHelper.ongoingEffects.modifyStats({ power: 4, hp: 0 })
                    })
                })
            }
        });
    }
}