import type { Card } from '../card/Card';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';
import type TriggeredAbility from './TriggeredAbility';

export interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    // TODO: rename this to "triggeringEvent"
    event: any;
    overrideTitle?: string;
}

export class TriggeredAbilityContext<TSource extends Card = Card> extends AbilityContext<TSource> {
    public readonly event: any;
    public readonly overrideTitle?: string;
    public override readonly ability: TriggeredAbility;

    public constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
        this.overrideTitle = properties.overrideTitle;
    }

    public override isTriggered(): this is TriggeredAbilityContext<TSource> {
        return true;
    }

    public override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext<TSource>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { event: this.event, overrideTitle: this.overrideTitle });
    }

    public cancel() {
        this.event.cancel();
    }
}
