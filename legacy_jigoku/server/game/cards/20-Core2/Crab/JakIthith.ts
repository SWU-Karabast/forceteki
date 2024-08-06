import { CardTypes, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

const ATTACHMENT = 'attachment';
const RECEIVER = 'receiver';

export default class JakIthith extends DrawCard {
    static id = 'jak-ithith';

    setupCardAbilities() {
        this.persistentEffect({
            effect: [
                AbilityDsl.effects.immunity({ restricts: 'maho' }),
                AbilityDsl.effects.immunity({ restricts: 'shadowlands' }),
                AbilityDsl.effects.cardCannot('receiveTaintedToken')
            ]
        });

        this.reaction({
            title: 'Take control of an attachment',
            when: {
                afterConflict: (event, context) =>
                    event.conflict.winner === context.source.controller && context.source.isParticipating()
            },
            targets: {
                [ATTACHMENT]: {
                    cardType: CardTypes.Attachment,
                    cardCondition: (card) =>
                        card.parent && card.parent.type === CardTypes.Character && card.parent.isParticipating()
                },
                [RECEIVER]: {
                    dependsOn: ATTACHMENT,
                    cardType: CardTypes.Character,
                    controller: Players.Self,
                    cardCondition: (card) => card.isParticipating(),
                    gameAction: AbilityDsl.actions.ifAble((context) => ({
                        ifAbleAction: AbilityDsl.actions.attach({
                            attachment: context.targets[ATTACHMENT],
                            target: context.targets[RECEIVER],
                            takeControl: true
                        }),
                        otherwiseAction: AbilityDsl.actions.discardFromPlay({ target: context.targets[ATTACHMENT] })
                    }))
                }
            }
        });
    }
}