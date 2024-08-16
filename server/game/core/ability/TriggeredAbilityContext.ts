import Card from '../card/Card';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';

interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    event: any;
}

export class TriggeredAbilityContext<TSource = Card> extends AbilityContext<TSource> {
    event: any;

    constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
    }

    override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext<this>(Object.assign(this.getProps(), newProps));
    }

    override getProps() {
        return Object.assign(super.getProps(), { event: this.event });
    }

    cancel() {
        this.event.cancel();
    }
}
