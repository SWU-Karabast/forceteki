import type { Card } from '../card/Card';
import type { ReplacementEffectWindow } from '../gameSteps/abilityWindow/ReplacementEffectWindow';
import { TriggeredAbilityContext, type ITriggeredAbilityContextProperties } from './TriggeredAbilityContext';

interface IReplacementEffectContextProperties extends ITriggeredAbilityContextProperties {
    replacementEffectWindow: ReplacementEffectWindow;
}

export class ReplacementEffectContext<TSource extends Card = Card> extends TriggeredAbilityContext<TSource> {
    public readonly replacementEffectWindow: any;

    public constructor(properties: IReplacementEffectContextProperties) {
        super(properties);
        this.replacementEffectWindow = properties.replacementEffectWindow;
    }

    public override createCopy(newProps: unknown) {
        return new ReplacementEffectContext<TSource>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { replacementEffectWindow: this.replacementEffectWindow });
    }
}
