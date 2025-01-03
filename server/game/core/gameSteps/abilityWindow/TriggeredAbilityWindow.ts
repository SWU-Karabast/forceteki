import type { AbilityType } from '../../Constants';
import type { EventWindow } from '../../event/EventWindow';
import type Game from '../../Game';
import { TriggerWindowBase } from './TriggerWindowBase';

export class TriggeredAbilityWindow extends TriggerWindowBase {
    public constructor(
        game: Game,
        triggerAbilityType: AbilityType.Triggered | AbilityType.DelayedEffect,
        eventWindow?: EventWindow
    ) {
        super(game, triggerAbilityType, eventWindow);
    }
}
