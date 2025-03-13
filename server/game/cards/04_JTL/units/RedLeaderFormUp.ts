import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';

export default class RedLeaderFormUp extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3711891756',
            internalName: 'red-leader#form-up',
        };
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'This unit costs 1 resource less to play for each friendly Pilot unit and upgrade',
            amount: (_card, player) =>
                player.getArenaUnits({
                    condition: (card) => card.hasSomeTrait(Trait.Pilot)
                }).length + player.getArenaUpgrades({
                    condition: (card) => card.hasSomeTrait(Trait.Pilot)
                }).length
        });

        this.addTriggeredAbility({
            title: 'Create an X-Wing token',
            when: {
                onUpgradeAttached: (event, context) => event.parentCard === context.source && event.upgradeCard.hasSomeTrait(Trait.Pilot)
            },
            immediateEffect: AbilityHelper.immediateEffects.createXWing()
        });
    }
}

