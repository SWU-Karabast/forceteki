import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import type { WhenTypeOrStandard } from '../../../Interfaces';

export default class PadmeAmidalaWhatDoYouHaveToHide extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'padme-amidala#what-do-you-have-to-hide-id',
            internalName: 'padme-amidala#what-do-you-have-to-hide',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Exhaust Padmé Amidala to deal 1 damage to a unit',
            optional: true,
            collectiveTrigger: true,
            when: this.triggerCondition(),
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Deal 1 damage to a unit',
                targetResolver: {
                    cardTypeFilter: WildcardCardType.Unit,
                    zoneFilter: WildcardZoneName.AnyArena,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a unit',
            optional: true,
            collectiveTrigger: true,
            when: this.triggerCondition(),
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }

    private triggerCondition(): WhenTypeOrStandard<LeaderUnitCard> {
        return {
            onCardDiscarded: (event, context) =>
                event.card.owner === context.player &&
                event.discardedFromZone === ZoneName.Hand,
            onCardRevealed: (event, context) =>
                event.cards.some((card) => card.owner === context.player) &&
                event.revealedFromZone === ZoneName.Hand
        };
    }
}