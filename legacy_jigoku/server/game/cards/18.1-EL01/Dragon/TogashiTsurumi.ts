import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';
import { CardTypes, Locations, Players, PlayTypes } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type Player from '../../../player';

export default class TogashiTsurumi extends DrawCard {
    static id = 'togashi-tsurumi';

    public setupCardAbilities() {
        this.persistentEffect({
            effect: AbilityDsl.effects.modifyBothSkills(() => this.getSkillBonus())
        });

        this.persistentEffect({
            location: Locations.PlayArea,
            targetLocation: this.uuid,
            targetController: Players.Self,
            match: (card) => card.location === this.uuid && card.hasTrait('kiho'),
            effect: [
                AbilityDsl.effects.canPlayFromOutOfPlay(
                    (player: Player) => player === this.controller,
                    PlayTypes.PlayFromHand
                ),
                AbilityDsl.effects.registerToPlayFromOutOfPlay()
            ]
        });

        this.action({
            title: 'Place a card underneath self',
            effect: 'place a card from their hand beneath {1} and draw a card',
            effectArgs: (context) => [context.source],
            target: {
                activePromptTitle: 'Choose a card',
                location: Locations.Hand,
                controller: Players.Self,
                cardType: [CardTypes.Event, CardTypes.Attachment, CardTypes.Character],
                gameAction: AbilityDsl.actions.multiple([
                    AbilityDsl.actions.draw((context) => ({
                        target: context.player,
                        amount: 1
                    })),
                    AbilityDsl.actions.handler({
                        handler: (context) => {
                            const card = context.target;
                            context.player.moveCard(card, this.uuid);
                            card.controller = context.source.controller;
                            card.facedown = false;
                            card.lastingEffect(() => ({
                                until: {
                                    onCardMoved: (event: any) =>
                                        event.card === card && event.originalLocation === this.uuid
                                },
                                match: card,
                                effect: [AbilityDsl.effects.hideWhenFaceUp()]
                            }));
                        }
                    })
                ])
            }
        });
    }

    private getSkillBonus() {
        return (this.game.allCards as Array<BaseCard>).reduce(
            (total, card) => (card.controller === this.controller && card.location === this.uuid ? total + 1 : total),
            0
        );
    }
}
