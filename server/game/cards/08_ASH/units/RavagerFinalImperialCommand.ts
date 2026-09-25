import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { Arena } from '../../../core/Constants';
import { CardType, WildcardCardType } from '../../../core/Constants';
import type { IGameStateGetter } from '../../../core/lki/GameStateGetter';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class RavagerFinalImperialCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4828998087',
            internalName: 'ravager#final-imperial-command',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper, gameState: IGameStateGetter) {
        registrar.addTriggeredAbility({
            title: 'Deal damage equal to its power to a unit in the same arena',
            contextTitle: (context) => `Deal ${this.playedUnitPower(context, gameState)} damage to a unit in the ${EnumHelpers.arenaName(this.playedUnitArena(context, gameState))}`,
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player
            },
            targetResolver: {
                activePromptTitle: (context) =>
                    `Deal ${this.playedUnitPower(context, gameState)} damage to a unit in the ${EnumHelpers.arenaName(this.playedUnitArena(context, gameState))}`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === this.playedUnitArena(context, gameState),
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: this.playedUnitPower(context, gameState),
                    source: context.event.card
                }))
            }
        });
    }

    /** The unit's power, whether it is currently in play or has just left play. */
    private playedUnitPower(context, gameState: IGameStateGetter): number {
        const played = gameState.getLastKnownProperties(context.event.card).asUnit();
        return played.isInPlay() ? played.power : played.printedPower;
    }

    /** The arena the played unit is in, or was in when it left play.*/
    private playedUnitArena(context, gameState: IGameStateGetter): Arena {
        const zone = gameState.getLastKnownProperties(context.event.card).zoneName;
        return EnumHelpers.isArena(zone) ? zone : context.event.card.defaultArena;
    }
}
