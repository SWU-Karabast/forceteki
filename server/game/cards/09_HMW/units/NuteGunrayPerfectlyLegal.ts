import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { Card } from '../../../core/card/Card';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, RelativePlayer, TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class NuteGunrayPerfectlyLegal extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'nute-gunray#perfectly-legal-id',
            internalName: 'nute-gunray#perfectly-legal'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Each friendly unit deals 1 damage to a different enemy unit',
            targetResolver: {
                mode: TargetMode.ExactlyVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
                numCardsFunc: (context) => this.countValidDamageInstances(context),
            },
            then: (chosenUnitsContext) => ({
                title: 'Each friendly unit deals 1 damage to a different enemy unit',
                immediateEffect: AbilityHelper.immediateEffects.simultaneous(
                    chosenUnitsContext.target?.map((friendlyUnit) =>
                        AbilityHelper.immediateEffects.selectCard({
                            activePromptTitle: `${friendlyUnit.title} deals 1 damage to an enemy unit`,
                            player: RelativePlayer.Self,
                            controller: RelativePlayer.Opponent,
                            cardTypeFilter: WildcardCardType.Unit,
                            cardCondition: (card, context) => !this.damagedCardsFromContext(context).has(card),
                            immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1, source: friendlyUnit })
                        })
                    )
                )
            })
        });
    }

    private countValidDamageInstances(context: AbilityContext): number {
        return Math.min(
            context.player.getArenaUnits().length,
            context.player.opponent.getArenaUnits().length
        );
    }

    private damagedCardsFromContext(context: AbilityContext): Set<Card> {
        return new Set(context.events.filter((event) => event.name === EventName.OnDamageDealt).map((event) => event.card));
    }
}
