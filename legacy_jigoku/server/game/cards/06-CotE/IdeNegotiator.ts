import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class IdeNegotiator extends DrawCard {
    static id = 'ide-negotiator';

    setupCardAbilities() {
        this.reaction({
            title: 'Modify honor dial',
            effect: 'modify their honor dial',
            when: { onHonorDialsRevealed: () => true },
            gameAction: AbilityDsl.actions.chooseAction((context) => ({
                options: {
                    'Increase bid by 1': {
                        action: AbilityDsl.actions.setHonorDial({
                            target: context.player,
                            value: context.player.honorBid + 1
                        }),
                        message: '{0} chooses to increase their honor bid by 1'
                    },
                    'Decrease bid by 1': {
                        action: AbilityDsl.actions.setHonorDial({
                            target: context.player,
                            value: context.player.honorBid - 1
                        }),
                        message: '{0} chooses to decrease their honor bid by 1'
                    }
                }
            }))
        });
    }
}
