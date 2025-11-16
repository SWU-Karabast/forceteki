import type { Card } from '../card/Card';
import * as Contract from '../utils/Contract';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';
import type TriggeredAbility from './TriggeredAbility';

export interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    // TODO: rename this to "triggeringEvent"
    event: any;
    overrideTitle?: string;
}

export class TriggeredAbilityContext<TSource extends Card = Card> extends AbilityContext<TSource> {
    public readonly event: any;
    public declare readonly ability: TriggeredAbility;

    private _overrideTitle: string = null;

    public get overrideTitle(): string | null {
        return this._overrideTitle;
    }

    public constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
        this._overrideTitle = properties.overrideTitle;
    }

    public setOverrideTitle(title: string) {
        Contract.assertIsNullLike(this._overrideTitle, () => `Override title has already been set to ${this._overrideTitle}`);
        this._overrideTitle = title;
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
