import { CardDataGetter } from './CardDataGetter';
import type { ICardDataJson } from './CardDataInterfaces';

/** Extends {@link CardDataGetter} with synchronous get methods */
export abstract class SynchronousCardDataGetter extends CardDataGetter {
    protected abstract getCardSynchronousInternal(relativePath: string): ICardDataJson;
    public abstract getSetCodeMapSynchronous(): Map<string, string>;
    public abstract getPlayableCardTitlesSynchronous(): string[];

    public getCardSynchronous(id: string): ICardDataJson {
        const relativePath = this.getRelativePathFromInternalName(this.getInternalName(id));
        return this.getCardByNameSynchronousInternal(relativePath);
    }

    public getCardByNameSynchronous(internalName: string): ICardDataJson {
        this.checkInternalName(internalName);
        return this.getCardByNameSynchronousInternal(this.getRelativePathFromInternalName(internalName));
    }

    protected getCardByNameSynchronousInternal(relativePath: string): ICardDataJson {
        return this.getCardSynchronousInternal(relativePath);
    }

    public override getSetCodeMap(): Promise<Map<string, string>> {
        return Promise.resolve(this.getSetCodeMapSynchronous());
    }

    public override getPlayableCardTitles(): Promise<string[]> {
        return Promise.resolve(this.getPlayableCardTitlesSynchronous());
    }

    protected override getCardInternal(relativePath: string): Promise<ICardDataJson> {
        return Promise.resolve(this.getCardSynchronous(relativePath));
    }
}
