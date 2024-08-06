import { Players, Locations, CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class KuniWasteland extends ProvinceCard {
    static id = 'kuni-wasteland';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            targetController: Players.Opponent,
            targetLocation: Locations.PlayArea,
            match: (card) => card.type === CardTypes.Character,
            effect: [
                AbilityDsl.effects.cardCannot({
                    cannot: 'triggerAbilities',
                    restricts: 'nonForcedAbilities'
                }),
                AbilityDsl.effects.cardCannot({
                    cannot: 'initiateKeywords',
                    restricts: 'keywordAbilities'
                })
            ]
        });
    }
}
