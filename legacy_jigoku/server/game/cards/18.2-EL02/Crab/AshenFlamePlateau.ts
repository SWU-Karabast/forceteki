import { Durations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class AshenFlamePlateau extends ProvinceCard {
    static id = 'ashen-flame-plateau';

    setupCardAbilities() {
        this.reaction({
            title: 'Prevent opponent from triggering character abilities',
            when: {
                onConflictDeclared: (event, context) => event.conflict.declaredProvince === context.source
            },
            effect: 'prevent {1} from triggering character abilities this conflict',
            effectArgs: (context) => [context.player.opponent],
            gameAction: AbilityDsl.actions.conflictLastingEffect((context) => ({
                duration: Durations.UntilEndOfConflict,
                effect: [
                    AbilityDsl.effects.charactersCannot({
                        cannot: 'triggerAbilities',
                        restricts: 'opponentsCharacters',
                        applyingPlayer: context.player
                    }),
                    AbilityDsl.effects.charactersCannot({
                        cannot: 'initiateKeywords',
                        restricts: 'opponentsCharacters',
                        applyingPlayer: context.player
                    })
                ]
            }))
        });
    }
}
