import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class RavagerFinalImperialCommand extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4828998087',
            internalName: 'ravager#final-imperial-command',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal damage equal to its power to a unit in the same arena',
            optional: true,
            when: {
                onCardPlayed: (event, context) =>
                    event.cardTypeWhenInPlay === CardType.BasicUnit &&
                    event.player === context.player
            },
            targetResolver: {
                activePromptTitle: (context) =>
                    `Deal ${context.event.card.getPower()} damage to a unit in the ${EnumHelpers.arenaName(context.event.card.zoneName)}`,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card.zoneName === context.event.card.zoneName,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: context.event.card.getPower(),
                    source: context.event.card
                }))
            }
        });
    }
}