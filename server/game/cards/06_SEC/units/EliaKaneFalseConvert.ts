import type { IAbilityHelper } from '../../../AbilityHelper';
import type { AbilityContext } from '../../../core/ability/AbilityContext';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { IInPlayCard } from '../../../core/card/baseClasses/InPlayCard';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer } from '../../../core/Constants';
import * as Helpers from '../../../core/utils/Helpers';

export default class EliaKaneFalseConvert extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'elia-kane#false-convert-id',
            internalName: 'elia-kane#false-convert'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addWhenPlayedAbility({
            title: 'Look at 3 enemy resources',
            immediateEffect: AbilityHelper.immediateEffects.randomSelection((context) => ({
                target: context.player.opponent.resources,
                count: Math.min(3, context.player.opponent.resources.length),
                innerSystem: AbilityHelper.immediateEffects.lookAtAndSelectCard((lookAtContext) => ({
                    activePromptTitle: 'Select an enemy resource to defeat. If you do, its controller puts the top card of their deck into play as a resource and readies it.',
                    displayTextByCardUuid: new Map(
                        Helpers.asArray(lookAtContext.targets.randomTarget)
                            .map((card) => [card.uuid, card.exhausted ? 'Exhausted' : 'Ready'])
                    ),
                    immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                        AbilityHelper.immediateEffects.handler({
                            handler: (handlerContext) => this.customLogMessage(handlerContext)
                        }),
                        AbilityHelper.immediateEffects.defeat(),
                        AbilityHelper.immediateEffects.resourceCard({
                            targetPlayer: RelativePlayer.Opponent,
                            target: context.player.opponent.getTopCardOfDeck(),
                            readyResource: true,
                        }),
                    ])
                }))
            }))
        });
    }

    private customLogMessage(context: AbilityContext) {
        if (context.selectedPromptCards.length === 0) {
            return;
        }

        const selectedCard = context.selectedPromptCards[0] as IInPlayCard;

        context.game.addMessage('{0} uses {1} to defeat {2} {3} from {4}\'s resources.',
            context.player,
            context.source,
            selectedCard.exhausted ? 'an exhausted' : 'a ready',
            selectedCard,
            context.player.opponent
        );

        if (context.player.opponent.getTopCardOfDeck()) {
            context.game.addMessage('{0} puts the top card of their deck into play as a resource and readies it, due to {1}.',
                context.player.opponent,
                context.source
            );
        }
    }
}