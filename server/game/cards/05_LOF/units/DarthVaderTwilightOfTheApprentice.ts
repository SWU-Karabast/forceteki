import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';

export default class DarthVaderTwilightOfTheApprentice extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2277278592',
            internalName: 'darth-vader#twilight-of-the-apprentice',
        };
    }

    public override setupCardAbilities(card: this) {
        card.addWhenPlayedAbility({
            title: 'Give a Shield token to a friendly unit and to an enemy unit',
            targetResolvers: {
                friendlyUnit: {
                    controller: RelativePlayer.Self,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                },
                enemyUnit: {
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.giveShield()
                }
            }
        });

        card.addOnAttackAbility({
            title: 'Defeat an enemy unit with a Shield token on it',
            targetResolvers: {
                enemyUnit: {
                    controller: RelativePlayer.Opponent,
                    cardCondition: (card) => card.isUnit() && card.hasShield(),
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }
            }
        });
    }
}
