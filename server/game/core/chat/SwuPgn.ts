import type { IPgnHeader, IPgnPlayerDecklist, IPgnReplayRecord, IStructureMarker } from './PgnTypes';

export class SwuPgn {
    /**
     * Formats a SET#NUM identifier: uppercases the set and zero-pads the number to 3 digits.
     */
    public static formatSetId(set: string, number: number): string {
        return `${set.toUpperCase()}#${String(number).padStart(3, '0')}`;
    }

    /**
     * Returns "Title, Subtitle" when subtitle is provided, or just "Title".
     */
    public static formatCardName(title: string, subtitle?: string): string {
        if (subtitle) {
            return `${title}, ${subtitle}`;
        }
        return title;
    }

    /**
     * Formats the PGN header block as chess-style [Tag "Value"] lines.
     * Required tags are always emitted; optional tags (format, rounds) are omitted when absent.
     */
    public static formatHeader(header: IPgnHeader): string {
        const lines: string[] = [
            `[Game "${header.game}"]`,
            `[Date "${header.date}"]`,
            `[Player1 "${header.player1}"]`,
            `[Player2 "${header.player2}"]`,
            `[P1Leader "${header.p1Leader}"]`,
            `[P1Base "${header.p1Base}"]`,
            `[P2Leader "${header.p2Leader}"]`,
            `[P2Base "${header.p2Base}"]`,
            `[Result "${header.result}"]`,
            `[Reason "${header.reason}"]`,
        ];

        if (header.format != null) {
            lines.push(`[Format "${header.format}"]`);
        }

        if (header.rounds != null) {
            lines.push(`[Rounds "${header.rounds}"]`);
        }

        return lines.join('\n');
    }

    /**
     * Formats deck cards sorted alphabetically with count prefix.
     */
    private static formatDeckCards(deck: IPgnPlayerDecklist['deck']): string[] {
        const sorted = [...deck].sort((a, b) => a.name.localeCompare(b.name));
        return sorted.map((entry) => `  ${entry.count}x ${entry.name} = ${entry.setId}`);
    }

    /**
     * Formats one player's decklist subsection.
     */
    private static formatPlayerDecklist(label: string, decklist: IPgnPlayerDecklist): string {
        const lines: string[] = [
            `\u2500\u2500 ${label} \u2500\u2500`,
            `Leader: ${decklist.leader.name} = ${decklist.leader.setId}`,
            `Base: ${decklist.base.name} = ${decklist.base.setId}`,
            'Deck:',
            ...SwuPgn.formatDeckCards(decklist.deck),
        ];

        if (decklist.sideboard && decklist.sideboard.length > 0) {
            lines.push('Sideboard:');
            lines.push(...SwuPgn.formatDeckCards(decklist.sideboard));
        }

        return lines.join('\n');
    }

    /**
     * Formats both player decklists under an ═══ CARD INDEX ═══ heading.
     */
    public static formatCardIndex(p1Decklist: IPgnPlayerDecklist, p2Decklist: IPgnPlayerDecklist): string {
        const sections: string[] = [
            '\u2550\u2550\u2550 CARD INDEX \u2550\u2550\u2550',
            SwuPgn.formatPlayerDecklist('P1 Decklist', p1Decklist),
            SwuPgn.formatPlayerDecklist('P2 Decklist', p2Decklist),
        ];
        return sections.join('\n');
    }

    /**
     * Formats the machine-readable replay data section as JSON-lines.
     */
    public static formatReplayData(records: IPgnReplayRecord[]): string {
        const lines = ['=== REPLAY ===', ...records.map((r) => JSON.stringify(r))];
        return lines.join('\n');
    }

    /**
     * Formats the human-readable .swupgn file with: header, card index, freeform marker, human notation.
     * No replay data.
     */
    public static formatHumanFile(
        header: IPgnHeader,
        humanNotation: string,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist
    ): string {
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            '=== FREEFORM ===',
            humanNotation,
        ];
        return sections.join('\n\n');
    }

    /**
     * Formats the .swureplay file with: header, card index, replay marker + JSON-lines replay data.
     * No human notation.
     */
    public static formatReplayFile(
        header: IPgnHeader,
        p1Decklist: IPgnPlayerDecklist,
        p2Decklist: IPgnPlayerDecklist,
        replayData: IPgnReplayRecord[]
    ): string {
        const sections = [
            SwuPgn.formatHeader(header),
            SwuPgn.formatCardIndex(p1Decklist, p2Decklist),
            SwuPgn.formatReplayData(replayData),
        ];
        return sections.join('\n\n');
    }

    /**
     * Flattens a serialized game message (mixed array of strings/numbers/objects) into plain text.
     * - plain strings and numbers are converted directly
     * - objects with title/subtitle become card names
     * - objects with name become the name
     * - alert objects { alert: { type, message } } recurse into message
     * - arrays are flattened recursively and concatenated
     */
    public static flattenMessage(message: any): string {
        if (message == null) {
            return '';
        }

        if (typeof message === 'string') {
            return message;
        }

        if (typeof message === 'number') {
            return String(message);
        }

        if (Array.isArray(message)) {
            return message.map((part) => SwuPgn.flattenMessage(part)).join('');
        }

        if (typeof message === 'object') {
            // Alert object
            if ('alert' in message && message.alert != null) {
                return SwuPgn.flattenMessage(message.alert.message);
            }

            // Card object with title (direct card reference)
            if ('title' in message && message.title != null) {
                return SwuPgn.formatCardName(message.title, message.subtitle);
            }

            // Card short summary object (from getShortSummary): has name + subtitle
            if ('name' in message && message.name != null && 'subtitle' in message && message.subtitle) {
                return SwuPgn.formatCardName(message.name, message.subtitle);
            }

            // Player or other named object (no subtitle)
            if ('name' in message && message.name != null) {
                return String(message.name);
            }
        }

        return '';
    }

    /**
     * Replaces real player names with P1/P2 in text.
     * Possessive forms (Player's) are replaced before plain names to avoid double substitution.
     */
    public static anonymizePlayers(text: string, player1Name: string, player2Name: string): string {
        const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        let result = text;
        // Possessive forms first (the 's suffix acts as a natural word boundary)
        result = result.replace(new RegExp(`${escapeRegex(player1Name)}'s`, 'g'), "Player 1's");
        result = result.replace(new RegExp(`${escapeRegex(player2Name)}'s`, 'g'), "Player 2's");
        // Plain names with word boundary check to avoid corrupting card names
        // (e.g., player "Luke" must not rewrite "Luke Skywalker" into "Player 1 Skywalker")
        result = result.replace(new RegExp(`(?<![\\w])${escapeRegex(player1Name)}(?![\\w])`, 'g'), 'Player 1');
        result = result.replace(new RegExp(`(?<![\\w])${escapeRegex(player2Name)}(?![\\w])`, 'g'), 'Player 2');
        return result;
    }

    /**
     * Anonymize player names within a structured message, preserving card name objects.
     * Walks the message tree and replaces player names only in string parts and player-name
     * objects, leaving card objects (those with title or name+subtitle) untouched.
     */
    public static anonymizeMessage(message: any, player1Name: string, player2Name: string): any {
        if (message == null) {
            return message;
        }

        if (typeof message === 'string') {
            return SwuPgn.anonymizePlayers(message, player1Name, player2Name);
        }

        if (typeof message === 'number') {
            return message;
        }

        if (Array.isArray(message)) {
            return message.map((part) => SwuPgn.anonymizeMessage(part, player1Name, player2Name));
        }

        if (typeof message === 'object') {
            // Card objects with title — preserve card names
            if ('title' in message && message.title != null) {
                return message;
            }

            // Card short summary (name + subtitle) — preserve card names
            if ('name' in message && message.name != null && 'subtitle' in message && message.subtitle) {
                return message;
            }

            // Alert object — recurse into inner message
            if ('alert' in message && message.alert != null) {
                return {
                    ...message,
                    alert: {
                        ...message.alert,
                        message: SwuPgn.anonymizeMessage(message.alert.message, player1Name, player2Name),
                    },
                };
            }

            // Player or other named object (no subtitle) — anonymize the name
            if ('name' in message && message.name != null) {
                const name = String(message.name);
                if (name === player1Name) {
                    return { ...message, name: 'Player 1' };
                }
                if (name === player2Name) {
                    return { ...message, name: 'Player 2' };
                }
            }
        }

        return message;
    }

    /**
     * Iterates game messages, skips player chat, flattens each to text, anonymizes, and joins with newlines.
     * Messages are ISerializedMessage objects with { date, message } structure.
     * When structureMarkers are provided, injects round/phase headers and action numbering.
     */
    public static generateHumanNotation(
        messages: any[],
        player1Name: string,
        player2Name: string,
        structureMarkers: IStructureMarker[] = []
    ): string {
        const lines: string[] = [];

        // Build map of messageIndex -> markers
        const markersByIndex = new Map<number, IStructureMarker[]>();
        for (const marker of structureMarkers) {
            const existing = markersByIndex.get(marker.messageIndex) ?? [];
            existing.push(marker);
            markersByIndex.set(marker.messageIndex, existing);
        }

        for (let i = 0; i < messages.length; i++) {
            const markers = markersByIndex.get(i);
            if (markers) {
                for (const marker of markers) {
                    if (marker.type === 'round') {
                        if (lines.length > 0) lines.push('');
                        lines.push(`\u2550\u2550\u2550 ROUND ${marker.round} \u2550\u2550\u2550`);
                        lines.push('');
                    } else if (marker.type === 'phase') {
                        if (lines.length > 0 && lines[lines.length - 1] !== '') lines.push('');
                        lines.push(`\u2500\u2500\u2500 ${marker.phase} \u2500\u2500\u2500`);
                    }
                }
            }

            const entry = messages[i];
            const messageContent = entry?.message ?? entry;

            // Skip player chat messages
            if (Array.isArray(messageContent) && messageContent.length > 0 && messageContent[0]?.type === 'playerChat') {
                continue;
            }

            // Anonymize at the structured message level (preserves card title objects),
            // then flatten to text. No text-level pass needed — structured pass covers
            // all player name sources without corrupting card names.
            const anonymized = SwuPgn.anonymizeMessage(messageContent, player1Name, player2Name);
            const text = SwuPgn.flattenMessage(anonymized);
            if (!text) continue;

            let line = text;

            // Apply action numbering from markers
            if (markers) {
                const subEventMarker = markers.find((m) => m.type === 'subEvent');
                const actionMarker = markers.find((m) => m.type === 'action');

                if (subEventMarker && subEventMarker.actionNumber && subEventMarker.subEventLetter) {
                    line = `  ${subEventMarker.actionNumber}${subEventMarker.subEventLetter}. ${line}`;
                } else if (actionMarker && actionMarker.actionNumber) {
                    line = `${actionMarker.actionNumber}. ${line}`;
                }
            }

            lines.push(line);

            // Inject supplemental lines after the current message
            if (markers) {
                for (const marker of markers) {
                    if (marker.type === 'gameState' && marker.gameState) {
                        const s = marker.gameState;
                        lines.push(`  [Game State] Player 1: ${s.p1.baseHp}/${s.p1.baseMaxHp} HP, ${s.p1.handSize} cards, ${s.p1.resourcesReady}/${s.p1.resourcesTotal} resources, ${s.p1.credits} credits${s.p1.hasForce ? ', Force' : ''}${s.p1.hasInitiative ? ', Initiative' : ''}, ${s.p1.groundUnits} ground/${s.p1.spaceUnits} space | Player 2: ${s.p2.baseHp}/${s.p2.baseMaxHp} HP, ${s.p2.handSize} cards, ${s.p2.resourcesReady}/${s.p2.resourcesTotal} resources, ${s.p2.credits} credits${s.p2.hasForce ? ', Force' : ''}${s.p2.hasInitiative ? ', Initiative' : ''}, ${s.p2.groundUnits} ground/${s.p2.spaceUnits} space`);
                    }
                    if (marker.type === 'drawnCards' && marker.drawnCards && marker.drawnCards.length > 0) {
                        lines.push(`  [Cards Drawn] ${marker.player}: ${marker.drawnCards.join(', ')}`);
                    }
                    if (marker.type === 'resourcedCard' && marker.resourcedCard) {
                        lines.push(`  [Card Resourced] ${marker.player}: ${marker.resourcedCard}`);
                    }
                }
            }
        }

        return lines.join('\n');
    }
}
