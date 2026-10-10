import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import { GameStateChangeRequired } from '../core/Constants';
import type { AbilityContext } from '../core/ability/AbilityContext';
import { Duration, EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import type { Card } from '../core/card/Card';
import { Contract } from '../core/utils/Contract';
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
    protected override readonly defaultProperties: IGameSystemInput<ICardLastingEffectProperties> = {
        duration: null,
        effect: [],
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: IGameSystemInput<ICardAttackLastingEffectProperties> | ((context?: AbilityContext) => IGameSystemInput<ICardAttackLastingEffectProperties>)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<IGameSystemInput<ICardLastingEffectProperties>, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.UntilEndOfAttack });
        super(propertyWithDurationType);
    }

    protected override updateEvent(event: GameEvent, target: any, context: TContext, properties: ICardLastingEffectProperties, additionalProperties: Partial<IGameSystemInput<ICardLastingEffectProperties>> = {}): void {
        Contract.assertNotNullLike(target.activeAttack, `Attempting to apply an attack lasting effect to ${target.internalName} but it is not actively attacking`);

        return super.updateEvent(event, target, context, properties, additionalProperties);
    }

    protected override canAffectInternal(card: Card, context: TContext, properties: ICardLastingEffectProperties, mustChangeGameState = GameStateChangeRequired.None, additionalProperties: Partial<IGameSystemInput<ICardLastingEffectProperties>> = {}) {
        if (!card.isUnit()) {
            return false;
        }

        return super.canAffectInternal(card, context, properties, GameStateChangeRequired.None, additionalProperties);
    }
}
