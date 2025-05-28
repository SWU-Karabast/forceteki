import AbilityHelper from '../../../AbilityHelper';
import { RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { UpgradeCard } from '../../../core/card/UpgradeCard';

export default class SuperheavyIonCannon extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '5016817239',
            internalName: 'superheavy-ion-cannon'
        };
    }

    public override setupCardAbilities() {
        this.setAttachCondition((card: Card) => card.hasSomeTrait(Trait.CapitalShip) || card.hasSomeTrait(Trait.Transport));

        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Exhaust an enemy non-leader unit to deal indirect damage equal to its power to the controller',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal indirect damage equal to its power to the controller',
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({
                    target: ifYouDoContext.target.controller,
                    amount: ifYouDoContext.target.getPower(),
                }),
            })
        });
    }
}
