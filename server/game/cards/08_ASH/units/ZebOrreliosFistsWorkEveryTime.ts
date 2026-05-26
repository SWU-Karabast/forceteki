import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, WildcardCardType } from '../../../core/Constants';
import { EnumHelpers } from '../../../core/utils/EnumHelpers';

export default class ZebOrreliosFistsWorkEveryTime extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'zeb-orrelios#fists-work-every-time-id',
            internalName: 'zeb-orrelios#fists-work-every-time',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 3 Advantage tokens to another unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: abilityHelper.immediateEffects.giveAdvantage({ amount: 3 })
            },
        });

        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to a base',
            when: {
                onCardDefeated: (event, context) =>
                    EnumHelpers.isUnit(event.lastKnownInformation.type) &&
                    event.lastKnownInformation.controller === context.player &&
                    event.lastKnownInformation.upgrades.length > 0
            },
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}