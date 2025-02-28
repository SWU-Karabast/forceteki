import type { AbilityContext } from '../core/ability/AbilityContext';
import { Duration, EventName } from '../core/Constants';
import { GameSystem } from '../core/gameSystem/GameSystem';
import type { ICardLastingEffectProperties } from './CardLastingEffectSystem';
import { CardLastingEffectSystem } from './CardLastingEffectSystem';
import * as Contract from '../core/utils/Contract';
import type { Card } from '../core/card/Card';

export type ICardWhileSourceInPlayLastingEffectProperties = Omit<ICardLastingEffectProperties, 'duration'>;

/**
 * Helper subclass of {@link CardLastingEffectSystem} that specifically creates lasting effects targeting cards
 * which will last while the source of the effect is in play.
 */
export class CardWhileSourceInPlayLastingEffectSystem<TContext extends AbilityContext = AbilityContext> extends CardLastingEffectSystem<TContext> {
    public override readonly name = 'applyCardWhileSourceInPlayLastingEffect';
    public override readonly eventName = EventName.OnEffectApplied;
    protected override readonly defaultProperties: ICardLastingEffectProperties = {
        duration: null,
        effect: [],
        ability: null
    };

    // constructor needs to do some extra work to ensure that the passed props object ends up as valid for the parent class
    public constructor(propertiesOrPropertyFactory: ICardWhileSourceInPlayLastingEffectProperties | ((context?: AbilityContext) => ICardWhileSourceInPlayLastingEffectProperties)) {
        const propertyWithDurationType = GameSystem.appendToPropertiesOrPropertyFactory<ICardLastingEffectProperties, 'duration'>(propertiesOrPropertyFactory, { duration: Duration.WhileSourceInPlay });
        super(propertyWithDurationType);
    }

    protected override filterApplicableEffects(card: Card, effects: any[]) {
        return super.filterApplicableEffects(card, effects)
            .filter((effect) => this.whileSourceInPlayCondition(effect));
    }

    /**
     * If the duration is {@link Duration.WhileSourceInPlay}, checks if the source unit is still in play. Returns true if so, or if the duration is not `WhileSourceInPlay`.
     * */
    private whileSourceInPlayCondition(props: any) {
        if (props.duration !== Duration.WhileSourceInPlay) {
            return true;
        }

        Contract.assertTrue(props.source.canBeInPlay(), `${props.source.internalName} is not a legal target for an effect with duration '${Duration.WhileSourceInPlay}'`);

        return props.source.isInPlay();
    }
}
