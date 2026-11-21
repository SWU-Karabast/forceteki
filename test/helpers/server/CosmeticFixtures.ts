import { v4 as uuid } from 'uuid';

import type { ICosmeticEntity, RegisteredCosmeticType } from '../../../server/utils/cosmetics/CosmeticsInterfaces';

/** The bucket the client's upload route (forceteki-client `S3Service`) stores cosmetic images in. */
export const cosmeticImageOrigin = 'https://karabast-customization.s3.us-east-1.amazonaws.com';

/** Where the client's upload route stores the image for a cosmetic of this type and id. */
export function uploadedImagePath(type: RegisteredCosmeticType, id: string): string {
    return `${cosmeticImageOrigin}/${type}s/${id}.webp`;
}

/**
 * A cosmetic as the client's upload route registers it: a new UUID, and the path its image was uploaded to.
 */
export function uploadedCosmetic(type: RegisteredCosmeticType, title = `Test ${type}`): ICosmeticEntity {
    const id = uuid();
    return { id, title, type, path: uploadedImagePath(type, id) };
}
