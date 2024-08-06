import { AbilityContext, type AbilityContextProperties } from './AbilityContext';

interface TriggeredAbilityContextProperties extends AbilityContextProperties {
    event: any;
}

export class TriggeredAbilityContext<S = any> extends AbilityContext<S> {
    event: any;

    constructor(properties: TriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
    }

    createCopy(newProps: unknown) {
        return new TriggeredAbilityContext(Object.assign(this.getProps(), newProps));
    }

    getProps() {
        return Object.assign(super.getProps(), { event: this.event });
    }

    cancel() {
        this.event.cancel();
    }
}