import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class EnfysNestMarauder extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8107876051',
            internalName: 'enfys-nest#marauder'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'When a friendly unit is attacking using Ambush, the defender gets -3/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) =>
                card.isUnit() &&
                card.isInPlay() &&
                card.isDefending() &&
                card.activeAttack.attacker.controller === context.player &&
                card.activeAttack.isAmbush,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
        });
    }
}
