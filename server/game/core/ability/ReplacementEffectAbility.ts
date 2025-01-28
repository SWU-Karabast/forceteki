import { AbilityType } from '../Constants';
import type { IReplacementEffectAbilityProps, ITriggeredAbilityProps } from '../../Interfaces';
import type { Card } from '../card/Card';
import type Game from '../Game';
import TriggeredAbility from './TriggeredAbility';
import { ReplacementEffectSystem } from '../../gameSystems/ReplacementEffectSystem';
import type { GameEvent } from '../event/GameEvent';

export default class ReplacementEffectAbility extends TriggeredAbility {
    public constructor(game: Game, card: Card, properties: IReplacementEffectAbilityProps) {
        const { replaceWith: cancelProps, ...otherProps } = properties;
        const triggeredAbilityProps: ITriggeredAbilityProps =
            Object.assign(otherProps, { immediateEffect: new ReplacementEffectSystem(cancelProps) });

        super(game, card, triggeredAbilityProps, AbilityType.ReplacementEffect);
    }

    protected override invalidEventInTriggeredFor(event: GameEvent): boolean {
        return super.invalidEventInTriggeredFor(event) || (this.eventsTriggeredFor && this.eventsTriggeredFor.some((triggeredEvent) => triggeredEvent.hasReplacementEvent(event)));
    }
}
