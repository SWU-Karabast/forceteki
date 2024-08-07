import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';

interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    event: any;
}

export class TriggeredAbilityContext<S = any> extends AbilityContext<S> {
    event: any;

    constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
    }

    override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext(Object.assign(this.getProps(), newProps));
    }

    override getProps() {
        return Object.assign(super.getProps(), { event: this.event });
    }

    cancel() {
        this.event.cancel();
    }
}