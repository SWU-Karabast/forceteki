import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';

export default class RoseTicoDedicatedToTheCause extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5080989992',
            internalName: 'rose-tico#dedicated-to-the-cause'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Defeat a Shield token on a friendly unit. If you do, give 2 Experience tokens to that unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                cardCondition: (card, context) => card.isShield() && card.parentCard.controller === context.source.controller,
                immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                    // TODO: this is a hack to store the parent card of the upgrade before it's defeated.
                    // once last known state is implemented, we need to read the upgrade's parent card from that (same for on-attack)
                    AbilityHelper.immediateEffects.handler((context) => ({
                        handler: () => context.targets.upgradeParentCard = context.target.parentCard
                    })),
                    AbilityHelper.immediateEffects.defeat()
                ]),
            },
            ifYouDo: (context) => ({
                title: 'Give 2 Experience tokens to that unit',
                immediateEffect: AbilityHelper.immediateEffects.giveExperience({
                    target: context.targets.upgradeParentCard,
                    amount: 2
                })
            })
        });
    }
}

RoseTicoDedicatedToTheCause.implemented = true;
