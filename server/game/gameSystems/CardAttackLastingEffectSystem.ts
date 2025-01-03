import type { AbilityContext } from '../core/ability/AbilityContext';
import { Duration, EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import type { Card } from '../core/card/Card';
import * as Contract from '../core/utils/Contract';
import type { GameEvent } from '../core/event/GameEvent';

export type ICardAttackLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * for the current attack.
 */
export class CardAttackLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardLastingEffectSystem<TContext> {
    public override readonly name = 'applyCardAttackLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    public override readonly effectDescription = 'apply an effect to {0} for the attack';
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ICardAttackLastingEffectProperties | ((context?: AbilityContext) => ICardAttackLastingEffectProperties)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<ICardLastingEffectProperties, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfAttack });
        super(propertyWithDurationType);
    }

    public override updateEvent(event: GameEvent, target: any, context: TContext, additionalProperties?: any): void {
        Contract.assertNotNullLike(target.activeAttack, `Attempting to apply an attack lasting effect to ${target.internalName} but it is not actively attacking`);

        return super.updateEvent(event, target, context, additionalProperties);
    }

    public override canAffect(card: Card, context: TContext) {
        if (!card.isUnit()) {
            return false;
        }

        return super.canAffect(card, context);
    }
}
