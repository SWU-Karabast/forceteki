import type FormData from 'form-data';

/**
 * Reads back the multipart body `DiscordDispatcher` posts to a webhook, so a spec can check what Discord
 * would receive rather than how the dispatcher was called.
 */

/** Splits the multipart body into its file parts, keyed by form field name (`files[0]`, `files[1]`, ...). */
export function getDiscordFileParts(formData: FormData): Map<string, string> {
    const body = formData.getBuffer().toString('utf8');
    const parts = body.split(`--${formData.getBoundary()}`);
    const files = new Map<string, string>();
    for (const part of parts) {
        const match = (/name="(files\[\d+\])"; filename="[^"]*"\r\nContent-Type: [^\r]*\r\n\r\n([\s\S]*)\r\n$/).exec(part);
        if (match) {
            files.set(match[1], match[2]);
        }
    }
    return files;
}

/** The `[name, value]` of each field in the message's first embed. */
export function getDiscordEmbedFields(formData: FormData): string[][] {
    const body = formData.getBuffer().toString('utf8');
    const payloadJson = (/name="payload_json"\r\n\r\n(.*)\r\n/).exec(body)[1];
    return JSON.parse(payloadJson).embeds[0].fields.map((field: { name: string; value: string }) => [field.name, field.value]);
}
