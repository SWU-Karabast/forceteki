import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class CityOfTheOpenHand extends StrongholdCard {
    static id = 'city-of-the-open-hand';

    setupCardAbilities() {
        this.action({
            title: 'Gain an honor',
            cost: AbilityDsl.costs.bowSelf(),
            condition: (context) => context.player.opponent && context.player.isLessHonorable(),
            gameAction: AbilityDsl.actions.gainHonor()
        });
    }

    //Needed for testing some cards
    loadOriginalAction() {
        this.abilities.actions = [];
        this.action({
            title: 'Steal an honor',
            cost: AbilityDsl.costs.bowSelf(),
            condition: (context) => context.player.opponent && context.player.isLessHonorable(),
            gameAction: AbilityDsl.actions.takeHonor()
        });
    }
}
