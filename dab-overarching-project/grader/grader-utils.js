/**
 * Calculate the Levenshtein distance between two strings.
 * The Levenshtein distance is the minimum number of single-character edits
 * (insertions, deletions, or substitutions) required to change one string into the other.
 * 
 * @param {string} str1 - The first string
 * @param {string} str2 - The second string
 * @returns {number} The Levenshtein distance between the two strings
 */
export function levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;

    // Create a 2D array to store distances
    const dp = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    // Initialize first column (distance from empty string)
    for (let i = 0; i <= len1; i++) {
        dp[i][0] = i;
    }

    // Initialize first row (distance from empty string)
    for (let j = 0; j <= len2; j++) {
        dp[0][j] = j;
    }

    // Fill in the rest of the matrix
    for (let i = 1; i <= len1; i++) {
        for (let j = 1; j <= len2; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                // Characters match, no operation needed
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                // Characters don't match, take minimum of three operations
                dp[i][j] = Math.min(
                    dp[i - 1][j] + 1,      // deletion
                    dp[i][j - 1] + 1,      // insertion
                    dp[i - 1][j - 1] + 1   // substitution
                );
            }
        }
    }

    return dp[len1][len2];
}
