import { Card } from '../card/Card';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';

interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    event: any;
}

export class TriggeredAbilityContext<TSource = Card> extends AbilityContext<TSource> {
    public event: any;

    public constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
    }

    public override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext<this>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { event: this.event });
    }

    public cancel() {
        this.event.cancel();
    }
}
