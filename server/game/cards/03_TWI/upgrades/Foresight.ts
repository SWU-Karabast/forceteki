import { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { PhaseName, TargetMode } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class Foresight extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '3962135775',
            internalName: 'foresight',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar) {
        registrar.addGainTriggeredAbilityTargetingAttached({
            title: 'Name a card',
            when: {
                onPhaseStarted: (event) => event.phase === PhaseName.Regroup
            },
            targetResolver: {
                mode: TargetMode.DropdownList,
                options: this.game.playableCardTitles,
            },
            then: (thenContext) => ({
                title: 'Look at the top card of your deck',
                immediateEffect: AbilityHelper.immediateEffects.lookAt((context) => ({
                    useDisplayPrompt: true,
                    target: context.player.getTopCardOfDeck()
                })),
                then: {
                    title: 'Reveal and draw the top card of deck',
                    optional: true,
                    thenCondition: (context) => thenContext.select === context.player.getTopCardOfDeck().title,
                    immediateEffect: AbilityHelper.immediateEffects.sequential([
                        AbilityHelper.immediateEffects.reveal((context) => ({
                            target: context.player.getTopCardOfDeck()
                        })),
                        AbilityHelper.immediateEffects.draw()
                    ])
                }
            })
        });
    }
}

