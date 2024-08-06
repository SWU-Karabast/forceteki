import { CardTypes, Durations, Players } from '../../Constants';
import { StrongholdCard } from '../../StrongholdCard';
import AbilityDsl from '../../abilitydsl';

export default class KyudenBayushi extends StrongholdCard {
    static id = 'kyuden-bayushi';

    setupCardAbilities() {
        this.action({
            title: 'Ready a dishonored character',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Self,
                cardCondition: (card) => card.isDishonored,
                gameAction: [
                    AbilityDsl.actions.ready(),
                    AbilityDsl.actions.cardLastingEffect((context) => ({
                        target: context.player.honor <= 6 ? context.target : [],
                        duration: Durations.UntilEndOfPhase,
                        effect: AbilityDsl.effects.modifyBothSkills(1)
                    }))
                ]
            },
            effect: '{1}{2}{3} {0}',
            effectArgs: (context) => [
                context.target.bowed ? 'ready' : '',
                context.target.bowed && context.player.honor <= 6 ? ' and ' : '',
                context.player.honor <= 6 ? 'give +1/+1 until the end of phase to' : ''
            ]
        });
    }
}
