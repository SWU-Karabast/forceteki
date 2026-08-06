import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, Duration, EventName, KeywordName } from '../../../core/Constants';
import type { Player } from '../../../core/Player';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class DeceptiveShade extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2554581368',
            internalName: 'deceptive-shade',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: `The next unit you play this phase gains ${TextHelper.Ambush} for this phase`,
            immediateEffect: AbilityHelper.immediateEffects.delayedPlayerEffect((context) => ({
                title: `The next unit you play this phase gains ${TextHelper.Ambush}`,
                when: {
                    onCardPlayed: (event, _) => this.isUnitPlayedEvent(event, context.player)
                },
                duration: Duration.UntilEndOfPhase,
                effectDescription: `give ${TextHelper.Ambush} to the next unit they play this phase`,
                immediateEffect: AbilityHelper.immediateEffects.cardLastingEffect((innerContext) => ({
                    target: innerContext.events.find((event) => this.isUnitPlayedEvent(event, context.player)).card,
                    effect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Ambush),
                    duration: Duration.UntilEndOfPhase
                }))
            }))
        });
    }

    private isUnitPlayedEvent(event, player: Player): boolean {
        return event.name === EventName.OnCardPlayed &&
          event.cardTypeWhenInPlay === CardType.BasicUnit &&
          event.card.controller === player;
    }
}