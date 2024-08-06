import { ConflictTypes, Players, Durations } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class KhansOrdu extends ProvinceCard {
    static id = 'khan-s-ordu';

    setupCardAbilities() {
        this.reaction({
            title: 'Make all conflicts military',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.multiple([
                AbilityDsl.actions.switchConflictType((context) => ({
                    targetConflictType: ConflictTypes.Military,
                    target: context.game.currentConflict && context.game.currentConflict.ring
                })),
                AbilityDsl.actions.playerLastingEffect({
                    targetController: Players.Any,
                    effect: AbilityDsl.effects.setConflictDeclarationType(ConflictTypes.Military),
                    duration: Durations.UntilEndOfPhase
                })
            ]),
            effect: 'switch the conflict type to {1} and make all future conflicts {1} for this phase',
            effectArgs: ['military']
        });
    }
}
