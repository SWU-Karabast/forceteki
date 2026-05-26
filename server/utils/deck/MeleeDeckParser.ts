import type { CardDataGetter } from '../cardData/CardDataGetter';
import type { ICardMapEntry } from '../cardData/CardDataInterfaces';
import type { ISwuDbFormatCardEntry, ISwuDbFormatDecklist } from './DeckInterfaces';

type MeleeSection = 'deck' | 'leader' | 'base' | 'sideboard';

const sectionNames: Record<string, MeleeSection> = {
    maindeck: 'deck',
    leader: 'leader',
    base: 'base',
    sideboard: 'sideboard'
};

export class MeleeDeckParseError extends Error {
    public constructor(message: string) {
        super(message);
        this.name = 'MeleeDeckParseError';
    }
}

export class MeleeDeckParser {
    private readonly cardNameToSetCode: Map<string, string>;

    public constructor(cardDataGetter: CardDataGetter) {
        this.cardNameToSetCode = MeleeDeckParser.buildCardNameToSetCodeMap(cardDataGetter);
    }

    public parse(deckText: string): ISwuDbFormatDecklist {
        const lines = deckText
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            throw new MeleeDeckParseError('Melee deck is empty');
        }

        let currentSection: MeleeSection | null = null;
        const deck: ISwuDbFormatCardEntry[] = [];
        const sideboard: ISwuDbFormatCardEntry[] = [];
        let leader: ISwuDbFormatCardEntry | null = null;
        let base: ISwuDbFormatCardEntry | null = null;

        for (const line of lines) {
            const section = sectionNames[MeleeDeckParser.normalizeSectionName(line)];
            if (section) {
                currentSection = section;
                continue;
            }

            if (!currentSection) {
                throw new MeleeDeckParseError(`Card line found before a Melee section: ${line}`);
            }

            const card = this.parseCardLine(line);
            switch (currentSection) {
                case 'deck':
                    deck.push(card);
                    break;
                case 'sideboard':
                    sideboard.push(card);
                    break;
                case 'leader':
                    leader = card;
                    break;
                case 'base':
                    base = card;
                    break;
                default:
                    throw new MeleeDeckParseError(`Unsupported Melee section: ${currentSection}`);
            }
        }

        if (!leader) {
            throw new MeleeDeckParseError('Melee deck is missing a leader');
        }
        if (!base) {
            throw new MeleeDeckParseError('Melee deck is missing a base');
        }
        if (deck.length === 0) {
            throw new MeleeDeckParseError('Melee deck is missing a main deck');
        }

        return {
            metadata: {
                name: 'Melee Import',
                author: ''
            },
            leader,
            base,
            deck,
            sideboard
        };
    }

    private parseCardLine(line: string): ISwuDbFormatCardEntry {
        const match = line.match(/^(\d+)\s+(.+)$/);
        if (!match) {
            throw new MeleeDeckParseError(`Invalid Melee card line: ${line}`);
        }

        const count = Number.parseInt(match[1], 10);
        const cardName = match[2].trim();
        const id = this.cardNameToSetCode.get(MeleeDeckParser.normalizeCardName(cardName));

        if (!id) {
            throw new MeleeDeckParseError(`Unknown Melee card name: ${cardName}`);
        }

        return { id, count };
    }

    private static buildCardNameToSetCodeMap(cardDataGetter: CardDataGetter): Map<string, string> {
        const cardIdToSetCode = new Map<string, string>();
        for (const [setCode, cardId] of cardDataGetter.setCodeMap.entries()) {
            if (!cardIdToSetCode.has(cardId)) {
                cardIdToSetCode.set(cardId, setCode);
            }
        }

        const cardNameToSetCode = new Map<string, string>();
        for (const card of cardDataGetter.cardMap.values()) {
            const setCode = cardIdToSetCode.get(card.id);
            if (!setCode) {
                continue;
            }

            cardNameToSetCode.set(MeleeDeckParser.normalizeCardName(MeleeDeckParser.toMeleeCardName(card)), setCode);
        }

        return cardNameToSetCode;
    }

    private static toMeleeCardName(card: ICardMapEntry): string {
        return `${card.title}${card.subtitle ? ` | ${card.subtitle}` : ''}`;
    }

    private static normalizeCardName(cardName: string): string {
        return cardName.replace(/\s+/g, ' ').trim()
            .toLowerCase();
    }

    private static normalizeSectionName(sectionName: string): string {
        return sectionName.replace(/\s+/g, '').trim()
            .toLowerCase();
    }
}
