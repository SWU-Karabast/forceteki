import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class FrontierTrader extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8095362491',
            internalName: 'frontier-trader'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may return a resource you control to your hand. If you do, you may put the top card of your deck into play as a resource.',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Resource,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            ifYouDo: (context) => ({
                title: 'Put the top card of your deck into play as a resource.',
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.resourceCard({ target: context.source.controller.getTopCardOfDeck() })
            })
        });
    }
}

FrontierTrader.implemented = true;
