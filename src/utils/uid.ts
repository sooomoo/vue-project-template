/**
 * 生成一个uid
 * @param noDash 是否不带-
 * @returns {string} uid
 */
export const newUid = (noDash = true): string => {
    const uid = crypto.randomUUID();
    return noDash ? uid.replace(/-/g, "") : uid;
};
