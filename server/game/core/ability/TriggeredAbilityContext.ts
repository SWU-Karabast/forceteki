import type { Card } from '../card/Card';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';

export interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    // TODO: rename this to "triggeringEvent"
    event: any;
}

export class TriggeredAbilityContext<TSource extends Card = Card> extends AbilityContext<TSource> {
    public readonly event: any;

    public constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
    }

    public override isTriggered(): this is TriggeredAbilityContext<TSource> {
        return true;
    }

    public override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext<TSource>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { event: this.event });
    }

    public cancel() {
        this.event.cancel();
    }
}
