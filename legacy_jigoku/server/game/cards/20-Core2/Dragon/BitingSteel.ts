import { CardTypes, DuelTypes, Durations, Players } from '../../../Constants';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';
import type BaseCard from '../../../basecard';
import type Player from '../../../player';
import type { AbilityContext } from '../../../AbilityContext';

function getAttachmentSkill(card: DrawCard, context: AbilityContext) {
    let amount = 0;
    if (context.game.currentDuel.duelType === DuelTypes.Military) {
        amount = parseInt(card.cardData.military_bonus);
    } else if (context.game.currentDuel.duelType === DuelTypes.Political) {
        amount = parseInt(card.cardData.political_bonus);
    }

    return isNaN(amount) ? 0 : amount;
}

export default class BitingSteel extends DrawCard {
    static id = 'biting-steel';

    public setupCardAbilities() {
        this.duelChallenge({
            title: 'Add a Weapon to your duel stats',
            duelCondition: (duel, context) =>
                (duel.duelType === DuelTypes.Military || duel.duelType === DuelTypes.Political) &&
                duel.isInvolved(context.source.parent),
            target: {
                cardType: CardTypes.Attachment,
                cardCondition: (card: DrawCard, context) =>
                    card.parent && card.parent === context.source.parent && getAttachmentSkill(card, context) !== 0,
                gameAction: AbilityDsl.actions.cardLastingEffect((context) => ({
                    target: context.target.parent,
                    effect: AbilityDsl.effects.modifyDuelistSkill(
                        getAttachmentSkill(context.target, context),
                        (context as any).event.duel
                    ),
                    duration: Durations.UntilEndOfDuel
                }))
            },
            effect: 'add the skill bonus of {0} ({1}) to their duel total',
            effectArgs: (context) => [getAttachmentSkill(context.target, context)]
        });

        this.action({
            title: 'Send an enemy home',
            condition: (context) =>
                (context.source.parent as DrawCard | undefined)?.isParticipating('military') &&
                (context.player as Player).hasAffinity('fire', context),
            target: {
                cardType: CardTypes.Character,
                controller: Players.Opponent,
                cardCondition: (card: DrawCard, context) => card.militarySkill < context.source.parent.militarySkill,
                gameAction: AbilityDsl.actions.sendHome()
            }
        });
    }

    public canAttach(card: BaseCard) {
        return (
            card.getType() === CardTypes.Character &&
            card.attachments.some((card) => card.hasTrait('weapon')) &&
            super.canAttach(card)
        );
    }

    public canPlay(context: TriggeredAbilityContext, playType: string) {
        return (
            context.player.cardsInPlay.any(
                (card: DrawCard) => card.getType() === CardTypes.Character && card.hasTrait('shugenja')
            ) && super.canPlay(context, playType)
        );
    }
}