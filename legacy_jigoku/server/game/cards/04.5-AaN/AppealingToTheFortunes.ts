import { CardTypes, Locations, Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class AppealingToTheFortunes extends ProvinceCard {
    static id = 'appealing-to-the-fortunes';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.role && context.player.role.hasTrait('void'),
            effect: AbilityDsl.effects.modifyProvinceStrength(2)
        });

        this.interrupt({
            title: 'Choose a character',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                location: [Locations.Provinces, Locations.Hand],
                gameAction: AbilityDsl.actions.putIntoPlay()
            }
        });
    }
}
