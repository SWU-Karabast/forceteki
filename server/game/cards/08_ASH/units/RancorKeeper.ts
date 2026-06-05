import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType, TargetMode } from '../../../core/Constants';

export default class RancorKeeper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1069133190',
            internalName: 'rancor-keeper',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Deal 1 damage to any number of bases',
            when: {
                onDamageDealt: (event, context) =>
                    !event.willDefeat &&
                    event.card.isUnit() &&
                    event.card.controller === context.player
            },
            limit: abilityHelper.limit.perRound(1),
            targetResolver: {
                activePromptTitle: 'Choose bases to deal 1 damage to',
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                cardTypeFilter: CardType.Base,
                immediateEffect: abilityHelper.immediateEffects.damage({ amount: 1 })
            }
        });
    }
}
