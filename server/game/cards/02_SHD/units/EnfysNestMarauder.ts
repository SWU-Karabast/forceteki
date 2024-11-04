import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class EnfysNestMarauder extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8107876051',
            internalName: 'enfys-nest#marauder'
        };
    }

    public override setupCardAbilities () {
        this.addConstantAbility({
            title: 'When a friendly unit is attacking using Ambush, the defender gets -3/-0',
            targetController: RelativePlayer.Opponent,
            matchTarget: (card, context) =>
                card.isUnit() &&
                card.isInPlay() &&
                card.isDefending() &&
                card.activeAttack.attacker.controller === context.source.controller &&
                card.activeAttack.isAmbush,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: -3, hp: 0 })
        });
    }
}

EnfysNestMarauder.implemented = true;
