import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson } from './CardDataInterfaces';

/** Extends {@link CardDataGetter} with synchronous get methods */
export abstract class SynchronousCardDataGetter extends CardDataGetter {
    protected abstract getCardSynchronousInternal(id: string): ICardDataJson;
    public abstract getSetCodeMapSynchronous(): Map<string, string>;

    public getCardSynchronous(id: string): ICardDataJson {
        this.assertCardId(id);
        return this.getCardSynchronousInternal(id);
    }

    public override getSetCodeMap(): Promise<Map<string, string>> {
        return Promise.resolve(this.getSetCodeMapSynchronous());
    }

    protected override getCardInternal(id: string): Promise<ICardDataJson> {
        return Promise.resolve(this.getCardSynchronous(id));
    }
}
