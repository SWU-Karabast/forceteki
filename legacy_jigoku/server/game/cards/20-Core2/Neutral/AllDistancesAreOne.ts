import type { AbilityContext } from '../../../AbilityContext';
import { CardTypes, Locations } from '../../../Constants';
import type { Cost } from '../../../Costs';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import type { Conflict } from '../../../conflict';
import DrawCard from '../../../drawcard';

const CAPTURED_ORIGINAL_PROVINCE = Symbol('Capture Province');

type WithCapturedOriginalProvince<T> = T & { [CAPTURED_ORIGINAL_PROVINCE]: ProvinceCard };

function captureOriginalProvince(): Cost {
    return {
        canPay() {
            return true;
        },
        resolve(context: AbilityContext) {
            context[CAPTURED_ORIGINAL_PROVINCE] = (context.game.currentConflict as Conflict).conflictProvince;
        },
        pay() {}
    };
}

export default class AllDistancesAreOne extends DrawCard {
    static id = 'all-distances-are-one';

    setupCardAbilities() {
        this.action({
            title: 'Move conflict to a different province',
            condition: (context) =>
                (context.game.currentConflict as Conflict | undefined)
                    ?.getConflictProvinces()
                    .every((province) => province.location !== Locations.StrongholdProvince) &&
                context.player.cardsInPlay.some(
                    (card: DrawCard) => card.isParticipating() && card.hasTrait('shugenja')
                ),
            cost: captureOriginalProvince(),
            gameAction: AbilityDsl.actions.selectCard((context) => ({
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                gameAction: AbilityDsl.actions.moveConflict(),
                message: '{0} moves the conflict to {1}',
                messageArgs: (card) => [context.player, card]
            })),
            effect: 'move the conflict to another eligible province',
            then: (context: WithCapturedOriginalProvince<AbilityContext>) => ({
                gameAction: AbilityDsl.actions.onAffinity({
                    trait: 'water',
                    promptTitleForConfirmingAffinity: 'Flip the original province facedown?',
                    effect: 'flip {0} facedown',
                    effectArgs: (context) => [context[CAPTURED_ORIGINAL_PROVINCE]],
                    gameAction: AbilityDsl.actions.turnFacedown({
                        target: context[CAPTURED_ORIGINAL_PROVINCE] as ProvinceCard
                    })
                })
            })
        });
    }
}