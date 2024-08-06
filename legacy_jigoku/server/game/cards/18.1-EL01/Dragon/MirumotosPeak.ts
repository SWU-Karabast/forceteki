import { CardTypes, Durations, Players } from '../../../Constants';
import { StrongholdCard } from '../../../StrongholdCard';
import AbilityDsl from '../../../abilitydsl';

export default class MirumotosPeak extends StrongholdCard {
    static id = 'mirumoto-s-peak';

    setupCardAbilities() {
        this.persistentEffect({
            match: (card) => card.attachments.filter((card) => card.hasTrait('weapon')).length >= 2,
            targetController: Players.Self,
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });

        this.action({
            title: 'Give weapons ancestral',
            cost: AbilityDsl.costs.bowSelf(),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Any,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.target.attachments.filter((card) => card.hasTrait('weapon')),
                    effect: AbilityDsl.effects.addKeyword('ancestral'),
                    duration: Durations.UntilEndOfRound
                }))
            },
            effect: "grant ancestral to {0}'s weapons ({1})",
            effectArgs: (context) => {
                const weapons = context.target.attachments.filter((card) => card.hasTrait('weapon'));
                return [weapons.length > 0 ? weapons : 'no weapons'];
            }
        });
    }
}
