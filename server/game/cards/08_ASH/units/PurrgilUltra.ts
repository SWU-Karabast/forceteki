import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventName, RelativePlayer, WildcardCardType } from '../../../core/Constants';
import type { TriggeredAbilityContext } from '../../../core/ability/TriggeredAbilityContext';

export default class PurrgilUltra extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3984721556',
            internalName: 'purrgil-ultra'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Return a friendly non-leader unit to its owner\'s hand',
            optional: true,
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                cardCondition: (card, context) => card.isUnit() && card !== context?.source,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: (thenContext) => {
                const leavesPlayEvent = this.getCardLeavesPlayEvent(thenContext);
                const lastKnownInformation = leavesPlayEvent?.lastKnownInformation;
                return {
                    title: `Deal ${lastKnownInformation?.cost ?? 0} damage to a unit`,
                    thenCondition: () => !!lastKnownInformation,
                    targetResolver: {
                        cardTypeFilter: WildcardCardType.Unit,
                        immediateEffect: AbilityHelper.immediateEffects.damage({ amount: lastKnownInformation?.cost ?? 0 })
                    }
                };
            }
        });
    }

    private getCardLeavesPlayEvent(context: TriggeredAbilityContext) {
        const topLevelEvents = context.events;
        const triggeredContextEvents = context.event.context.events;
        const allEvents = [...topLevelEvents, ...triggeredContextEvents];

        return allEvents.find((event) =>
            event.name === EventName.OnCardLeavesPlay &&
            event.card === context.target
        );
    }
}