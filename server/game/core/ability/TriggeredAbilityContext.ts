import type { Card } from '../card/Card';
import { Contract } from '../utils/Contract';
import { AbilityContext, type IAbilityContextProperties } from './AbilityContext';
import type { TriggeredAbilityBase } from './TriggeredAbility';

export interface ITriggeredAbilityContextProperties extends IAbilityContextProperties {
    // TODO: rename this to "triggeringEvent"
    event: any;
    overrideTitle?: string;
    preConfirmed?: boolean;

    /**
     * True if this ability was manually activated by a game system (e.g., UseWhenDefeatedSystem)
     * rather than being naturally triggered by a game event through the normal event handler flow.
     */
    retriggeredByAbility?: boolean;
}

export class TriggeredAbilityContext<TSource extends Card = Card> extends AbilityContext<TSource> {
    public readonly event: any;
    public declare readonly ability: TriggeredAbilityBase;
    public readonly retriggeredByAbility: boolean;

    private _overrideTitle: string = null;
    private _preConfirmed: boolean = false;

    public get overrideTitle(): string | null {
        return this._overrideTitle;
    }

    /**
     * True if the controller already committed to resolving this ability (e.g. during a Plot
     * declare-step) before it reaches the ability resolver, so the resolver should not prompt
     * for a redundant Trigger / Pass confirmation.
     */
    public get preConfirmed(): boolean {
        return this._preConfirmed;
    }

    public constructor(properties: ITriggeredAbilityContextProperties) {
        super(properties);
        this.event = properties.event;
        this._overrideTitle = properties.overrideTitle;
        this._preConfirmed = properties.preConfirmed || false;
        this.retriggeredByAbility = properties.retriggeredByAbility || false;
    }

    public setOverrideTitle(title: string) {
        Contract.assertIsNullLike(this._overrideTitle, () => `Override title has already been set to ${this._overrideTitle}`);
        this._overrideTitle = title;
    }

    public markPreConfirmed() {
        Contract.assertFalse(this._preConfirmed, 'Context has already been marked as pre-confirmed');
        this._preConfirmed = true;
    }

    public override isTriggered(): this is TriggeredAbilityContext<TSource> {
        return true;
    }

    public override createCopy(newProps: unknown) {
        return new TriggeredAbilityContext<TSource>(Object.assign(this.getProps(), newProps));
    }

    public override getProps() {
        return Object.assign(super.getProps(), { event: this.event, overrideTitle: this.overrideTitle, preConfirmed: this.preConfirmed, retriggeredByAbility: this.retriggeredByAbility });
    }

    public cancel() {
        this.event.cancel();
    }
}
