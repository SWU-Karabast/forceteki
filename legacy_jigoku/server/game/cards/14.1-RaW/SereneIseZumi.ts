import { CardTypes, Locations, Players } from '../../Constants';
import { PlayCharacterAsAttachment } from '../../PlayCharacterAsAttachment';
import AbilityDsl from '../../abilitydsl';
import DrawCard from '../../drawcard';

export default class SereneIseZumi extends DrawCard {
    static id = 'serene-ise-zumi';

    setupCardAbilities() {
        this.abilities.playActions.push(new PlayCharacterAsAttachment(this));
        this.attachmentConditions({
            myControl: true
        });
        this.action({
            title: 'Move attached character home',
            printedAbility: false,
            condition: (context) =>
                context.source.parent &&
                context.game.isDuringConflict() &&
                context.source.type === CardTypes.Attachment &&
                context.source.parent.isParticipating(),
            gameAction: AbilityDsl.actions.sendHome((context) => ({
                target: context.source.parent
            }))
        });
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            condition: (context) => context.source.type === CardTypes.Attachment,
            effect: AbilityDsl.effects.loseKeyword('sincerity')
        });
        this.persistentEffect({
            location: Locations.Any,
            targetController: Players.Any,
            effect: AbilityDsl.effects.reduceCost({
                amount: 2,
                targetCondition: (target) => target.type === CardTypes.Character,
                match: (card, source) => card === source
            })
        });
    }
}
