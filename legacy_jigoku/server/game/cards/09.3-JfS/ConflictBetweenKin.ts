import { Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ConflictBetweenKin extends ProvinceCard {
    static id = 'conflict-between-kin';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            targetController: Players.Opponent,
            match: (card) => card.isParticipating(),
            effect: [
                AbilityDsl.effects.cardCannot({
                    cannot: 'target',
                    restricts: 'eventsWithSameClan'
                }),
                AbilityDsl.effects.cardCannot({
                    cannot: 'target',
                    restricts: 'attachmentsWithSameClan'
                })
            ]
        });
    }
}
