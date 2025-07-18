import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class JynErsoResistingOppression extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8244682354',
            internalName: 'jyn-erso#resisting-oppression',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Attack with a unit. The defender gets -1/-0 for this attack.',
            cost: AbilityHelper.costs.exhaustSelf(),
            initiateAttack: {
                defenderLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'While a friendly unit is attacking, the defender gets -1/-0.',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) => card.isUnit() && card.isInPlay() && card.isDefending() && card.activeAttack.attacker.controller === context.player,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -1, hp: 0 })
        });
    }
}
