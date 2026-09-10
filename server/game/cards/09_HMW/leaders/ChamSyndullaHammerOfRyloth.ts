import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, DamageType, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class ChamSyndullaHammerOfRyloth extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'cham-syndulla#hammer-of-ryloth-id',
            internalName: 'cham-syndulla#hammer-of-ryloth'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Exhaust this leader to deal 1 damage to an enemy unit or base',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    event.card.controller === context.player &&
                    (event.card.isUnit() || event.card.isBase()) &&
                    event.type !== DamageType.Combat &&
                    event.type !== DamageType.Overwhelm
            },
            immediateEffect: AbilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Deal 1 damage to an enemy unit or base',
                targetResolver: {
                    cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                    controller: RelativePlayer.Opponent,
                    immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to an enemy unit or base',
            optional: true,
            when: {
                onDamageDealt: (event, context) =>
                    event.card.controller === context.player &&
                    (event.card.isUnit() || event.card.isBase()) &&
                    event.type !== DamageType.Combat &&
                    event.type !== DamageType.Overwhelm
            },
            targetResolver: {
                cardTypeFilter: [WildcardCardType.Unit, CardType.Base],
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
