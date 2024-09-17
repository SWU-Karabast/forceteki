import { AbilityType } from '../../Constants';
import { GameEvent } from '../../event/GameEvent';
import Game from '../../Game';
import { TriggeredAbilityWindowBaseClass } from './TriggeredAbilityWindowBaseClass';
import { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';

export class GlobalTriggeredAbilityWindow extends TriggeredAbilityWindowBaseClass {
    public constructor(game: Game,
        //If this is a window of nested triggers, the parent window is the window to return to after this is finished resolving.
        private parentTriggeredAbilityWindow:GlobalTriggeredAbilityWindow = null
    ) {
        super(game, AbilityType.Triggered);
    }

    public triggerOnEvents(events: GameEvent[]) {
        events.forEach((event) => {
            this.game.emit(event.name + ':' + this.triggerAbilityType, event, this);
        });
        if (this.triggeringEvents) {
            this.triggeringEvents.push(...events);
        } else {
            this.triggeringEvents = events;
        }
    }

    public override continue(): boolean {
        const returnValue = super.continue();
        if (returnValue) {
            //The global triggered ability window has cleared, so reset its state(retaining the same parent if this is a nested window).
            this.game.globalTriggeredAbilityWindow = new GlobalTriggeredAbilityWindow(this.game, this.parentTriggeredAbilityWindow);
        }
        return returnValue;
    }

    protected override resolveAbility(context: TriggeredAbilityContext) {
        //Create a nested triggered ability window.
        this.game.globalTriggeredAbilityWindow = new GlobalTriggeredAbilityWindow(this.game, this);

        super.resolveAbility(context);

        //Try to fully resolve this window, and return the game to its parent window if it does so.
        this.game.queueSimpleStep(() => {
            if (this.continue() && this.parentTriggeredAbilityWindow) {
                this.game.globalTriggeredAbilityWindow = this.parentTriggeredAbilityWindow;
            }
        }, `Resolve nested triggered ability window for ${context.ability}`);
    }
}