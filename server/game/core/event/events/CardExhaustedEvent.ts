import { EventName } from '../../Constants';
import type { AbilityContext } from '../../ability/AbilityContext';
import type { IExhaustSource } from '../../../IDamageOrDefeatSource';
import type { ICardWithExhaustProperty } from '../../card/baseClasses/PlayableOrDeployableCard';
import { CardTargetGameEvent } from '../TypedGameEvent';

export class CardExhaustedEvent extends CardTargetGameEvent<ICardWithExhaustProperty> {
    public exhaustSource: IExhaustSource;

    public constructor(context: AbilityContext, cannotBeCancelled = false) {
        super(EventName.OnCardExhausted, context, cannotBeCancelled);
    }
}
