import AbilityHelper from '../../AbilityHelper';
import { NonLeaderUnitCard } from '../../core/card/NonLeaderUnitCard';
import { CardType, RelativePlayer } from '../../core/Constants';

export default class AvengerHuntingStarDestroyer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8240629990',
            internalName: 'avenger#hunting-star-destroyer'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Choose a friendly non-leader unit to defeat',
            when: {
                onAttackDeclared: (event, context) => event.attack.attacker === context.source,
                onCardPlayed: (event, context) => event.card === context.source
            },
            targetResolver: {
                choosingPlayer: RelativePlayer.Opponent,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: CardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            }
        });
    }
}

AvengerHuntingStarDestroyer.implemented = true;