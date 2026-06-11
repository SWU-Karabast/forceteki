import type { Card } from '../card/Card';
import type { ReplacementEffectWindow } from '../gameSteps/abilityWindow/ReplacementEffectWindow';
import { TriggeredAbilityContext, type ITriggeredAbilityContextProperties } from './TriggeredAbilityContext';

interface IReplacementEffectContextProperties extends ITriggeredAbilityContextProperties {
    replacementEffectWindow: ReplacementEffectWindow;
}

export class ReplacementEffectContext<TSource extends Card = Card> extends TriggeredAbilityContext<TSource> {
    public readonly replacementEffectWindow: any;

    public constructor(properties: IReplacementEffectContextProperties) {
        // `properties` comes from this card's freshly-built trigger context — not from the context
        // of the ability whose event we're replacing — so by default we'd carry a fresh, empty
        // resolutionState. But a replacement effect resolves the same conceptual step as the
        // event it replaces, so any prompt result it produces needs to be visible to that outer
        // ability's later steps. The replaced event's context is reachable via `properties.event`;
        // borrow its resolutionState so writes here land on the shared object.
        const replacedContext = properties.event?.context;
        super({
            ...properties,
            resolutionState: replacedContext?.resolutionState ?? properties.resolutionState,
        });
        this.replacementEffectWindow = properties.replacementEffectWindow;
    }

    public override createCopy(newProps: unknown) {
        return new ReplacementEffectContext<TSource>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { replacementEffectWindow: this.replacementEffectWindow });
    }

    public override isReplacement(): this is ReplacementEffectContext<TSource> {
        return true;
    }
}
