import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait, WildcardCardType } from '../../../core/Constants';

export default class SandcrawlerSalesTeam extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'sandcrawler-sales-team-id',
            internalName: 'sandcrawler-sales-team',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return an upgrade that costs 3 or less to its owner\'s hand',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card) => card.hasCost() && card.cost <= 3,
                immediateEffect: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.base.hasSomeTrait(Trait.Tatooine),
                    onTrue: abilityHelper.immediateEffects.returnToHand()
                })
            },
        });
    }
}