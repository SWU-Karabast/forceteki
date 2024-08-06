import AbilityDsl from '../../../abilitydsl';
import { EventNames, FavorTypes, Locations, Phases, Stages } from '../../../Constants';
import DrawCard from '../../../drawcard';
import { EventRegistrar } from '../../../EventRegistrar';
import type { TriggeredAbilityContext } from '../../../TriggeredAbilityContext';

export default class Funeral extends DrawCard {
    static id = 'funeral';

    private eventRegistrar?: EventRegistrar;

    public setupCardAbilities() {
        this.eventRegistrar = new EventRegistrar(this.game, this);
        this.eventRegistrar.register([EventNames.OnCardPlayed]);

        this.wouldInterrupt({
            title: 'Cancel honor loss',
            when: {
                onModifyHonor: (event, context) =>
                    event.player === context.player &&
                    -event.amount >= context.player.honor &&
                    event.context.stage === Stages.Effect,
                onTransferHonor: (event, context) =>
                    event.player === context.player &&
                    event.amount >= context.player.honor &&
                    event.context.stage === Stages.Effect
            },
            cannotBeMirrored: true,
            effect: 'cancel their honor loss, then gain 1 honor',
            gameAction: AbilityDsl.actions.sequential([
                AbilityDsl.actions.cancel(),
                AbilityDsl.actions.gainHonor((context) => ({ target: context.player }))
            ])
        });
    }

    public canPlay(context: TriggeredAbilityContext, playType: string) {
        return (
            context.game.currentPhase !== Phases.Draw &&
            context.game.getFavorSide() === FavorTypes.Political &&
            super.canPlay(context, playType)
        );
    }

    public onCardPlayed(event: any) {
        if (event.card === this) {
            if (this.location !== Locations.RemovedFromGame) {
                this.game.addMessage('{0} is removed from the game due the effects of {0}', this);
                this.owner.moveCard(this, Locations.RemovedFromGame);
            }
        }
    }
}