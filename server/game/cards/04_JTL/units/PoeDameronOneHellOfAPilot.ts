import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, Trait } from '../../../core/Constants';

export default class PoeDameronOneHellOfAPilot extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '8757741946',
            internalName: 'poe-dameron#one-hell-of-a-pilot',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Create a X-Wing token',
            immediateEffect: AbilityHelper.immediateEffects.createXWing({
                amount: 1
            }),
            then: (thenContext) => ({
                title: 'Attach this unit as an upgrade to a friendly Vehicle unit without a Pilot on it',
                optional: true,
                targetResolver: {
                    controller: RelativePlayer.Self,
                    cardCondition: (card) => card.isUnit() && card.hasSomeTrait(Trait.Vehicle) && !card.upgrades.some((upgrade) => upgrade.hasSomeTrait(Trait.Pilot)),
                    immediateEffect: AbilityHelper.immediateEffects.attachUpgrade((context) => ({
                        upgrade: context.source,
                    })),
                }
            })
        });
    }
}
