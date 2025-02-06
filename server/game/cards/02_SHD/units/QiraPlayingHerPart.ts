import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Duration, TargetMode } from '../../../core/Constants';
import * as AbilityLimit from '../../../core/ability/AbilityLimit';

export default class QiraPlayingHerPart extends NonLeaderUnitCard {
    protected override readonly overrideNotImplemented: boolean = true;

    protected override getImplementationId() {
        return {
            id: '7964782056',
            internalName: 'qira#playing-her-part'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'Look at an opponent\'s hand',
            immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                target: context.player.opponent.hand,
            })),
            then: {
                title: 'Name a card',
                targetResolver: {
                    mode: TargetMode.DropdownList,
                    options: this.game.playableCardTitles,
                },
                then: (thenContext) => ({
                    title: 'While this unit is in play, each card with that name costs 3 resources more for your opponents to play',
                    immediateEffect: AbilityHelper.immediateEffects.playerLastingEffect((context) => ({
                        duration: Duration.WhileSourceInPlay,
                        targetController: context.player.opponent,
                        effect: AbilityHelper.ongoingEffects.increaseCost({
                            amount: 3,
                            match: (card) => card.title === thenContext.select,
                            limit: AbilityLimit.unlimited()
                        })
                    }))
                })
            }
        });
    }
}
