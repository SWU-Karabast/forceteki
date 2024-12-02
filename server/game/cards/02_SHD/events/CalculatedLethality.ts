import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class CalculatedLethality extends EventCard {
    protected override getImplementationId() {
        return {
            id: '0302968596',
            internalName: 'calculated-lethality',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader unit that costs 3 or less',
            targetResolver: {
                cardCondition: (card) => card.isNonLeaderUnit() && card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.sequential([
                    // TODO: this is a hack to store data before it's defeated.
                    // once last known state is implemented, we need to read data from that
                    AbilityHelper.immediateEffects.handler((context) => ({
                        handler: () => context.targets.upgradeAmount = context.target.upgrades.length
                    })),
                    AbilityHelper.immediateEffects.defeat()
                ])
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'For each upgrade that was on that unit, give an Experience token to a friendly unit.',
                immediateEffect: AbilityHelper.immediateEffects.distributeExperienceAmong({
                    amountToDistribute: ifYouDoContext.targets.upgradeAmount,
                    cardTypeFilter: WildcardCardType.Unit,
                    controller: RelativePlayer.Self,
                    canChooseNoTargets: false,
                    canDistributeLess: false,
                }),
            })
        });
    }
}

CalculatedLethality.implemented = true;
