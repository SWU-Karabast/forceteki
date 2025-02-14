import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';

export default class LethalCrackdown extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1389085256',
            internalName: 'lethal-crackdown'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat a non-leader unit.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.NonLeaderUnit,
                immediateEffect: AbilityHelper.immediateEffects.defeat()
            },
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal damage to your base equal to that unit\'s power.',
                immediateEffect: AbilityHelper.immediateEffects.damage({
                    target: ifYouDoContext.source.controller.base,
                    amount: ifYouDoContext.events[0].lastKnownInformation.power
                })
            })
        });
    }
}
